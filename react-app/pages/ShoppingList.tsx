import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, ShoppingCart, Package, X } from 'lucide-react';
import { useShoppingList } from '../hooks/useShoppingList';
import ShoppingItem from '../components/ShoppingItem';
import AddItemForm from '../components/AddItemForm';

export default function ShoppingList() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const listId = id;

  const {
    currentList,
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    resetList,
    clearError
  } = useShoppingList(listId);

  useEffect(() => {
    if (!listId) {
      navigate('/');
      return;
    }
  }, [listId, navigate]);

  const handleAddItem = (name: string) => {
    if (listId) {
      addItem(listId, name);
    }
  };

  const handleReset = () => {
    if (listId && confirm('Tem certeza que deseja resetar esta lista?')) {
      resetList(listId);
    }
  };

  const itemsNotInCart = items.filter(item => !item.is_in_cart);
  const itemsInCart = items.filter(item => item.is_in_cart);

  if (loading && !currentList) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 p-3 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Modern Header */}
        <div className="relative overflow-hidden bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 mb-8 shadow-2xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-orange-500/10"></div>
          
          <div className="relative z-10">
            {/* Navigation and actions */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 text-white/80 hover:text-white transition-all duration-200 hover:bg-white/10 px-4 py-2.5 rounded-xl hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-3 text-white/80 hover:text-white transition-all duration-200 hover:bg-white/10 px-4 py-2.5 rounded-xl hover:scale-105"
                title="Resetar lista"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="font-medium">Reset</span>
              </button>
            </div>
            
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text">
                {currentList?.name || 'Lista de Compras'}
              </h1>
              <p className="text-white/60">Gerencie seus produtos de forma inteligente</p>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-blue-300" />
                  <span className="text-white/70 text-sm font-medium">Total de Itens</span>
                </div>
                <div className="text-white font-bold text-xl">
                  {items.length}
                </div>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-300" />
                  <span className="text-white/70 text-sm font-medium">No Carrinho</span>
                </div>
                <div className="text-white font-bold text-xl">
                  {itemsInCart.length}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 border border-emerald-400/30 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-emerald-200 text-sm font-medium">Valor Total</span>
                </div>
                <div className="text-emerald-200 font-bold text-xl">
                  R$ {(currentList?.total_amount || 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm font-medium">Progresso da Lista</span>
              <span className="text-white/70 text-sm">
                {Math.round((itemsInCart.length / items.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 shadow-emerald-500/30"
                style={{ width: `${(itemsInCart.length / items.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Floating stats for mobile */}
        <div className="sm:hidden fixed top-4 right-4 z-50">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
            <div className="text-white text-sm font-medium">
              {itemsInCart.length}/{items.length} • R$ {(currentList?.total_amount || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Add Item Form */}
        <AddItemForm onAddItem={handleAddItem} disabled={loading} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-xl p-4 mb-6 text-red-100">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-200 hover:text-white ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Items to Buy */}
        {itemsNotInCart.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Para Comprar ({itemsNotInCart.length})
            </h2>
            <div className="space-y-3">
              {itemsNotInCart.map(item => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* Items in Cart */}
        {itemsInCart.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              No Carrinho ({itemsInCart.length})
            </h2>
            <div className="space-y-3">
              {itemsInCart.map(item => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md mx-auto">
              <Package className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                Sua lista está vazia
              </h3>
              <p className="text-white/70">
                Comece adicionando alguns produtos à sua lista de compras.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
