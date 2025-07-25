import { useState, useEffect } from 'react';
import { ShoppingList, ShoppingItem, UpdateShoppingItem } from '../../shared/types';
import { supabase } from '../supabase';
import { useSupabase } from '../components/SupabaseProvider';

export function useShoppingList(listId?: number | string) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [currentList, setCurrentList] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tablesExist, setTablesExist] = useState({ lists: true, items: true });
  const { user } = useSupabase();

  // Verificar se as tabelas existem (apenas uma vez)
  const checkTablesExist = async () => {
    if (!user) return;

    try {
      // Testar tabela shopping_lists (silencioso)
      const { error: listsError } = await supabase
        .from('shopping_lists')
        .select('count')
        .limit(1);

      // Testar tabela shopping_items (silencioso)
      const { error: itemsError } = await supabase
        .from('shopping_items')
        .select('count')
        .limit(1);

      const newTablesExist = {
        lists: !listsError,
        items: !itemsError
      };

      setTablesExist(newTablesExist);

      // Log apenas uma vez quando detectar mudança
      if (!newTablesExist.lists && tablesExist.lists) {
        console.warn('⚠️ Tabela shopping_lists não encontrada');
      }
      if (!newTablesExist.items && tablesExist.items) {
        console.warn('⚠️ Tabela shopping_items não encontrada - usando dados mock');
        console.log('📋 Para resolver: Execute o SQL no Dashboard do Supabase (veja MANUAL_SUPABASE_SETUP.md)');
      }
      if (newTablesExist.items && !tablesExist.items) {
        console.log('✅ Tabela shopping_items agora está disponível!');
      }
    } catch (err) {
      console.error('Erro ao verificar tabelas:', err);
      setTablesExist({ lists: false, items: false });
    }
  };

  // Fetch all lists
  const fetchLists = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error: listError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (listError) {
        console.error('Erro ao carregar listas:', listError);
        setError('Erro ao carregar listas');
        // Usar dados mock
        setLists([
          {
            id: 1,
            name: 'Lista de Exemplo',
            user_id: user.id,
            total_amount: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      } else {
        setLists(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro de conexão');
      // Usar dados mock
      setLists([
        {
          id: 1,
          name: 'Lista de Exemplo',
          user_id: user.id,
          total_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific list with items
  const fetchListWithItems = async (id: number | string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      if (!tablesExist.lists) {
        console.log('📋 Usando dados mock para lista (tabela não existe)');
        setCurrentList({
          id: typeof id === 'string' ? parseInt(id) || 1 : id,
          name: 'Compras do Mês',
          user_id: user.id,
          total_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setItems([]);
        setError('Tabela shopping_lists não encontrada. Usando dados de exemplo.');
        return;
      }
      
      // Buscar a lista
      const { data: listData, error: listError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (listError) {
        console.error('Erro ao carregar lista:', listError);
        // Usar dados mock baseados no ID da URL
        setCurrentList({
          id: typeof id === 'string' ? parseInt(id) || 1 : id,
          name: 'Compras do Mês',
          user_id: user.id,
          total_amount: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setItems([]);
        setError('Lista não encontrada. Usando dados de exemplo.');
        return;
      }

      setCurrentList(listData);
      
      if (!tablesExist.items) {
        console.log('📋 Usando dados mock para itens (tabela não existe)');
        setItems([]);
        setError('Tabela shopping_items não encontrada. Funcionalidade limitada.');
        return;
      }
      
      // Buscar itens da lista
      const { data: itemsData, error: itemsError } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('shopping_list_id', id)
        .order('created_at', { ascending: true });
      
      if (itemsError) {
        // Log silencioso para erro de tabela não existir
        if (itemsError.code === '42P01' || itemsError.message.includes('does not exist')) {
          setTablesExist(prev => ({ ...prev, items: false }));
          setError('Tabela shopping_items não encontrada. Execute o SQL no Dashboard do Supabase.');
        } else {
          console.error('Erro ao carregar itens:', itemsError);
          setError('Erro ao carregar itens da lista');
        }
        setItems([]);
      } else {
        setItems(itemsData || []);
        setError(null);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro de conexão');
      // Usar dados mock
      setCurrentList({
        id: typeof id === 'string' ? parseInt(id) || 1 : id,
        name: 'Compras do Mês',
        user_id: user.id,
        total_amount: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new list
  const createList = async (name: string) => {
    if (!user) return;
    
    try {
      const { data, error: createError } = await supabase
        .from('shopping_lists')
        .insert([{
          name: name.trim(),
          user_id: user.id,
          total_amount: 0
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('Erro ao criar lista:', createError);
        setError('Erro ao criar lista');
      } else {
        setLists(prev => [data, ...prev]);
        return data;
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro de conexão');
    }
  };

  // Add item to list
  const addItem = async (listId: number | string, name: string) => {
    if (!user) return;
    
    // Sempre adicionar item mock se tabela não existir
    const mockItem = {
      id: Date.now(),
      shopping_list_id: listId,
      name: name.trim(),
      quantity: 1,
      price: 0,
      is_in_cart: false,
      is_sold_by_weight: false,
      weight_kg: 0,
      price_per_kg: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!tablesExist.items) {
      console.log('📝 Adicionando item mock (tabela não existe):', name.trim());
      setItems(prev => [...prev, mockItem]);
      return;
    }
    
    try {
      const { data, error: addError } = await supabase
        .from('shopping_items')
        .insert([{
          shopping_list_id: listId,
          name: name.trim(),
          quantity: 1,
          price: 0,
          is_in_cart: false,
          is_sold_by_weight: false,
          weight_kg: 0,
          price_per_kg: 0
        }])
        .select()
        .single();
      
      if (addError) {
        // Log silencioso para erro de tabela não existir
        if (addError.code === '42P01' || addError.message.includes('does not exist')) {
          setTablesExist(prev => ({ ...prev, items: false }));
          console.log('📝 Adicionando item mock (tabela não existe):', name.trim());
          setError('Item adicionado localmente. Execute o SQL no Dashboard do Supabase para persistir.');
        } else {
          console.error('Erro ao adicionar item:', addError);
          setError('Item adicionado localmente (erro de conexão)');
        }
        
        // Sempre usar fallback
        setItems(prev => [...prev, mockItem]);
      } else {
        console.log('✅ Item adicionado no banco:', data.name);
        setItems(prev => [...prev, data]);
        setError(null);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setItems(prev => [...prev, mockItem]);
      setError('Item adicionado localmente (erro de conexão)');
    }
  };

  // Update item
  const updateItem = async (itemId: number, updates: UpdateShoppingItem) => {
    try {
      const { data, error: updateError } = await supabase
        .from('shopping_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Erro ao atualizar item:', updateError);
        setError('Erro ao atualizar item');
        
        // Fallback: atualizar localmente
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        ));
      } else {
        setItems(prev => prev.map(item => 
          item.id === itemId ? data : item
        ));
      }
      
      // Update current list total if needed
      if (currentList && (updates.price !== undefined || updates.quantity !== undefined || updates.is_in_cart !== undefined || updates.weight_kg !== undefined || updates.price_per_kg !== undefined || updates.is_sold_by_weight !== undefined)) {
        const updatedItems = items.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        );
        
        const newTotal = updatedItems.reduce((sum, item) => {
          return sum + (item.is_in_cart ? 
            (item.is_sold_by_weight ? 
              (item.weight_kg * item.price_per_kg) : 
              (item.price * item.quantity)
            ) : 0
          );
        }, 0);
        
        setCurrentList(prev => prev ? { ...prev, total_amount: newTotal } : null);
        
        // Atualizar total no banco
        supabase
          .from('shopping_lists')
          .update({ total_amount: newTotal })
          .eq('id', currentList.id)
          .then(({ error }) => {
            if (error) {
              console.error('Erro ao atualizar total da lista:', error);
            }
          });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro de conexão');
      
      // Fallback: atualizar localmente
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ));
    }
  };

  // Delete item
  const deleteItem = async (itemId: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', itemId);
      
      if (deleteError) {
        console.error('Erro ao deletar item:', deleteError);
        setError('Erro ao deletar item');
      }
      
      // Remover localmente independente do resultado
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro de conexão');
      
      // Remover localmente
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Reset list
  const resetList = async (listId: number | string) => {
    try {
      // Resetar todos os itens da lista
      const { error: resetError } = await supabase
        .from('shopping_items')
        .update({
          is_in_cart: false,
          price: 0,
          quantity: 1,
          is_sold_by_weight: false,
          weight_kg: 0,
          price_per_kg: 0
        })
        .eq('shopping_list_id', listId);
      
      if (resetError) {
        console.error('Erro ao resetar lista:', resetError);
        setError('Erro ao resetar lista');
      }
      
      // Atualizar localmente
      setItems(prev => prev.map(item => ({
        ...item,
        is_in_cart: false,
        price: 0,
        quantity: 1,
        is_sold_by_weight: false,
        weight_kg: 0,
        price_per_kg: 0
      })));
      
      // Resetar total da lista
      setCurrentList(prev => prev ? { ...prev, total_amount: 0 } : null);
      
      // Atualizar total no banco
      supabase
        .from('shopping_lists')
        .update({ total_amount: 0 })
        .eq('id', listId)
        .then(({ error }) => {
          if (error) {
            console.error('Erro ao atualizar total da lista:', error);
          }
        });
        
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro de conexão');
      
      // Resetar localmente
      setItems(prev => prev.map(item => ({
        ...item,
        is_in_cart: false,
        price: 0,
        quantity: 1,
        is_sold_by_weight: false,
        weight_kg: 0,
        price_per_kg: 0
      })));
      setCurrentList(prev => prev ? { ...prev, total_amount: 0 } : null);
    }
  };

  useEffect(() => {
    if (user) {
      checkTablesExist().then(() => {
        if (listId) {
          fetchListWithItems(listId);
        } else {
          fetchLists();
        }
      });
    }
  }, [listId, user]);

  return {
    lists,
    currentList,
    items,
    loading,
    error,
    fetchLists,
    fetchListWithItems,
    createList,
    addItem,
    updateItem,
    deleteItem,
    resetList,
    clearError: () => setError(null),
  };
}
