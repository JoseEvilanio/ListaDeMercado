import React, { useState, useEffect } from 'react';
import useRealtime from '../hooks/useRealtime';
import useMultiTableRealtime from '../hooks/useMultiTableRealtime';
import { supabase } from '../supabase';
import { ShoppingList, ShoppingItem } from '../../../shared/types';

/**
 * Componente para demonstrar funcionalidades em tempo real com listas de compras
 */
const RealtimeShoppingListDemo: React.FC = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assinatura em tempo real para listas de compras
  const listsRealtime = useRealtime({
    table: 'shopping_lists',
    onInsert: (payload) => {
      const newList = payload.new as ShoppingList;
      setShoppingLists((prev) => [...prev, newList]);
    },
    onUpdate: (payload) => {
      const updatedList = payload.new as ShoppingList;
      setShoppingLists((prev) =>
        prev.map((list) => (list.id === updatedList.id ? updatedList : list))
      );
    },
    onDelete: (payload) => {
      const deletedList = payload.old as ShoppingList;
      setShoppingLists((prev) => prev.filter((list) => list.id !== deletedList.id));
      if (selectedList === deletedList.id) {
        setSelectedList(null);
        setItems([]);
      }
    },
    onError: (err) => {
      setError(`Erro na assinatura de listas: ${err.message}`);
    }
  });

  // Assinatura em tempo real para itens da lista selecionada
  const itemsRealtime = useMultiTableRealtime({
    channelName: 'shopping_items_demo',
    tables: [
      { table: 'shopping_items', filter: selectedList ? `shopping_list_id=eq.${selectedList}` : undefined }
    ],
    callbacks: {
      shopping_items: {
        onInsert: (payload) => {
          const newItem = payload.new as ShoppingItem;
          if (newItem.shopping_list_id === selectedList) {
            setItems((prev) => [...prev, newItem]);
          }
        },
        onUpdate: (payload) => {
          const updatedItem = payload.new as ShoppingItem;
          if (updatedItem.shopping_list_id === selectedList) {
            setItems((prev) =>
              prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
            );
          }
        },
        onDelete: (payload) => {
          const deletedItem = payload.old as ShoppingItem;
          if (deletedItem.shopping_list_id === selectedList) {
            setItems((prev) => prev.filter((item) => item.id !== deletedItem.id));
          }
        }
      }
    },
    enabled: !!selectedList,
    onError: (err) => {
      setError(`Erro na assinatura de itens: ${err.message}`);
    }
  });

  // Carregar listas de compras ao montar o componente
  useEffect(() => {
    const fetchShoppingLists = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('shopping_lists')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setShoppingLists(data || []);
      } catch (err: any) {
        setError(`Erro ao carregar listas: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingLists();
  }, []);

  // Carregar itens quando uma lista é selecionada
  useEffect(() => {
    const fetchItems = async () => {
      if (!selectedList) {
        setItems([]);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('shopping_items')
          .select('*')
          .eq('shopping_list_id', selectedList)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setItems(data || []);
      } catch (err: any) {
        setError(`Erro ao carregar itens: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedList]);

  // Criar nova lista de compras
  const createShoppingList = async () => {
    if (!newListName.trim()) return;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .insert([{ name: newListName.trim(), total_amount: 0 }]);

      if (error) throw error;
      setNewListName('');
    } catch (err: any) {
      setError(`Erro ao criar lista: ${err.message}`);
    }
  };

  // Adicionar item à lista selecionada
  const addItem = async () => {
    if (!selectedList || !newItemName.trim()) return;

    try {
      const { error } = await supabase
        .from('shopping_items')
        .insert([{
          shopping_list_id: selectedList,
          name: newItemName.trim(),
          is_in_cart: false,
          price: 0,
          quantity: 1,
          is_sold_by_weight: false,
          weight_kg: 0,
          price_per_kg: 0
        }]);

      if (error) throw error;
      setNewItemName('');
    } catch (err: any) {
      setError(`Erro ao adicionar item: ${err.message}`);
    }
  };

  // Alternar status "no carrinho" de um item
  const toggleItemInCart = async (item: ShoppingItem) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({ is_in_cart: !item.is_in_cart })
        .eq('id', item.id);

      if (error) throw error;
    } catch (err: any) {
      setError(`Erro ao atualizar item: ${err.message}`);
    }
  };

  // Excluir item
  const deleteItem = async (itemId: number) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (err: any) {
      setError(`Erro ao excluir item: ${err.message}`);
    }
  };

  // Excluir lista
  const deleteList = async (listId: number) => {
    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
    } catch (err: any) {
      setError(`Erro ao excluir lista: ${err.message}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Demo de Listas de Compras em Tempo Real</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="text-sm underline" 
            onClick={() => setError(null)}
          >
            Fechar
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Lista de compras */}
        <div className="w-full md:w-1/3 bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Listas de Compras</h3>
            <div className="text-sm">
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${listsRealtime.isSubscribed ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {listsRealtime.isSubscribed ? 'Conectado' : 'Desconectado'}
            </div>
          </div>

          <div className="flex mb-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nova lista de compras"
              className="flex-1 border rounded-l px-3 py-2"
            />
            <button
              onClick={createShoppingList}
              className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Adicionar
            </button>
          </div>

          {loading && shoppingLists.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Carregando...</p>
          ) : shoppingLists.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma lista encontrada</p>
          ) : (
            <ul className="divide-y">
              {shoppingLists.map((list) => (
                <li key={list.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedList(list.id)}
                      className={`flex-1 text-left px-2 py-1 rounded ${selectedList === list.id ? 'bg-blue-100 font-medium' : ''}`}
                    >
                      {list.name}
                    </button>
                    <button
                      onClick={() => deleteList(list.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <span className="sr-only">Excluir</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Itens da lista selecionada */}
        <div className="w-full md:w-2/3 bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              {selectedList
                ? `Itens: ${shoppingLists.find(l => l.id === selectedList)?.name}`
                : 'Selecione uma lista'}
            </h3>
            {selectedList && (
              <div className="text-sm">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${itemsRealtime.isSubscribed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {itemsRealtime.isSubscribed ? 'Conectado' : 'Desconectado'}
              </div>
            )}
          </div>

          {selectedList && (
            <div className="flex mb-4">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Novo item"
                className="flex-1 border rounded-l px-3 py-2"
              />
              <button
                onClick={addItem}
                className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Adicionar
              </button>
            </div>
          )}

          {selectedList ? (
            loading && items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Carregando itens...</p>
            ) : items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum item nesta lista</p>
            ) : (
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.id} className="py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <input
                          type="checkbox"
                          checked={item.is_in_cart}
                          onChange={() => toggleItemInCart(item)}
                          className="mr-3 h-5 w-5"
                        />
                        <span className={item.is_in_cart ? 'line-through text-gray-500' : ''}>
                          {item.name}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <span className="sr-only">Excluir</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className="text-gray-500 text-center py-4">Selecione uma lista para ver os itens</p>
          )}
        </div>
      </div>

      {/* Informações de depuração */}
      <div className="mt-8 bg-gray-100 p-4 rounded text-sm">
        <h4 className="font-medium mb-2">Informações de Depuração</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Status da conexão:</strong> {listsRealtime.connectionStatus}</p>
            <p><strong>Canais ativos:</strong> {listsRealtime.channelInfo.channelCount}</p>
            <p><strong>Assinatura de listas:</strong> {listsRealtime.isSubscribed ? 'Ativa' : 'Inativa'}</p>
            <p><strong>Assinatura de itens:</strong> {itemsRealtime.isSubscribed ? 'Ativa' : 'Inativa'}</p>
          </div>
          <div>
            <p><strong>Último evento de listas:</strong></p>
            <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto max-h-20">
              {listsRealtime.lastEvent ? JSON.stringify(listsRealtime.lastEvent, null, 2) : 'Nenhum'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeShoppingListDemo;