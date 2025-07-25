import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, Package, Calendar, User, LogOut, AlertCircle } from 'lucide-react';
import { useSupabase } from '../components/SupabaseProvider';
import { supabase } from '../supabase';

export default function Home() {
  const navigate = useNavigate();
  const [newListName, setNewListName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { user, signOut } = useSupabase();

  // Estado real das listas
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Carregar listas do usuário
  const loadLists = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: listError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (listError) {
        console.error('Erro ao carregar listas:', listError);
        // Em vez de mostrar erro, usar dados mock
        setLists([
          {
            id: '1',
            name: 'Lista de Exemplo',
            description: 'Esta é uma lista de exemplo (tabela shopping_lists não encontrada)',
            total_amount: 0,
            created_at: new Date().toISOString()
          }
        ]);
        setError('Tabela shopping_lists não encontrada. Usando dados de exemplo.');
      } else {
        setLists(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      // Em caso de erro, usar dados mock
      setLists([
        {
          id: '1',
          name: 'Lista de Exemplo',
          description: 'Esta é uma lista de exemplo (erro ao conectar)',
          total_amount: 0,
          created_at: new Date().toISOString()
        }
      ]);
      setError('Erro ao conectar com o banco. Usando dados de exemplo.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar listas quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      loadLists();
    }
  }, [user]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !user) return;
    
    setCreateLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Criando lista:', newListName);
      
      const { data, error: createError } = await supabase
        .from('shopping_lists')
        .insert([{
          name: newListName.trim(),
          user_id: user.id,
          description: `Lista criada em ${new Date().toLocaleDateString('pt-BR')}`
        }])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Erro ao criar lista:', createError);
        
        if (createError.code === 'PGRST116' || createError.message.includes('relation') || createError.message.includes('does not exist')) {
          // Se a tabela não existe, criar uma lista mock
          const mockList = {
            id: Date.now().toString(),
            name: newListName.trim(),
            description: `Lista criada em ${new Date().toLocaleDateString('pt-BR')} (mock)`,
            user_id: user.id,
            total_amount: 0,
            created_at: new Date().toISOString()
          };
          
          setLists(prev => [mockList, ...prev]);
          setNewListName('');
          setShowCreateForm(false);
          alert(`Lista "${mockList.name}" criada localmente (tabela não encontrada no banco)`);
          setError('Tabela shopping_lists não encontrada. Lista criada localmente.');
        } else {
          setError(`Erro ao criar lista: ${createError.message}`);
        }
      } else {
        console.log('✅ Lista criada com sucesso:', data);
        setLists(prev => [data, ...prev]);
        setNewListName('');
        setShowCreateForm(false);
        alert(`Lista "${data.name}" criada com sucesso!`);
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      // Em caso de erro, criar lista mock
      const mockList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        description: `Lista criada em ${new Date().toLocaleDateString('pt-BR')} (erro)`,
        user_id: user.id,
        total_amount: 0,
        created_at: new Date().toISOString()
      };
      
      setLists(prev => [mockList, ...prev]);
      setNewListName('');
      setShowCreateForm(false);
      alert(`Lista "${mockList.name}" criada localmente (erro no banco)`);
      setError('Erro no banco. Lista criada localmente.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const clearError = () => {
    // Mock function
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com informações do usuário */}
        <div className="flex justify-between items-center mb-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Olá, {user?.name || 'Usuário'}!</h2>
              <p className="text-white/70 text-sm">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-all duration-200 flex items-center gap-2"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12 pt-4 sm:pt-8 px-4 sm:px-0">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
            Mobile Device Database
          </h1>
          <p className="text-base sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Aplicativo web responsivo com Supabase como banco de dados.
            Funciona perfeitamente em desktop, tablet e dispositivos móveis.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl flex items-center gap-3"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base">Criar Nova Lista</span>
            </button>
            
            <button
              onClick={() => navigate('/demo')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl flex items-center gap-3"
            >
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-sm sm:text-base">Ver Demos</span>
            </button>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold text-white mb-4">Nova Lista</h2>
              <form onSubmit={handleCreateList}>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nome da lista (ex: Compras da Semana)"
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:border-white/50 mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewListName('');
                    }}
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white font-medium py-3 rounded-xl transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newListName.trim() || createLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all duration-200"
                  >
                    {createLoading ? 'Criando...' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 text-red-100">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-200 hover:text-white ml-auto"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Listas do Usuário */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Suas Listas</h2>
          
          {loading && (
            <div className="text-center py-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
                <p className="text-white/70">Carregando listas...</p>
              </div>
            </div>
          )}
          
          {!loading && lists.length === 0 && (
            <div className="text-center py-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
                <ShoppingCart className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhuma lista criada</h3>
                <p className="text-white/70 mb-4">Crie sua primeira lista de compras!</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Criar Lista
                </button>
              </div>
            </div>
          )}
          
          {!loading && lists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => (
                <div
                  key={list.id}
                  onClick={() => {
                    console.log('🔗 Navegando para lista:', list.id, list.name);
                    navigate(`/list/${list.id}`);
                  }}
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 cursor-pointer transition-all duration-500 hover:bg-white/15 hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/10"
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Header with icon and title */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-emerald-400/20 group-hover:scale-110 transition-transform duration-300">
                          <ShoppingCart className="w-6 h-6 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-emerald-200 transition-colors duration-300">
                            {list.name}
                          </h3>
                          <p className="text-white/60 text-sm">Lista de compras</p>
                        </div>
                      </div>
                    </div>
                    
                    {list.description && (
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">{list.description}</p>
                    )}
                    
                    {/* Stats section with modern design */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-emerald-400" />
                          <span className="text-white/70 text-sm">Total</span>
                        </div>
                        <div className="text-white font-bold text-lg">
                          R$ {(list.total_amount || 0).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-teal-400" />
                          <span className="text-white/70 text-sm">Criada</span>
                        </div>
                        <div className="text-white font-medium text-sm">
                          {formatDate(list.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Call to action */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-400/20 group-hover:border-emerald-400/40 transition-colors duration-300">
                      <span className="text-emerald-200 font-medium">Ver lista completa</span>
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors duration-300">
                        <span className="text-emerald-300 text-lg">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status do Sistema */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Status do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-100 font-medium">Autenticação</span>
              </div>
              <p className="text-green-200 text-sm">Conectado como {user?.name}</p>
            </div>
            
            <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-100 font-medium">Supabase</span>
              </div>
              <p className="text-green-200 text-sm">Banco de dados ativo</p>
            </div>
            
            <div className="bg-green-500/20 rounded-xl p-4 border border-green-400/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-100 font-medium">Responsivo</span>
              </div>
              <p className="text-green-200 text-sm">Design adaptativo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}