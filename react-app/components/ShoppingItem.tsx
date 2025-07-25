import { useState } from 'react';
import { Check, X, Edit2, Plus, Minus, Scale } from 'lucide-react';
import { ShoppingItem as ShoppingItemType, UpdateShoppingItem } from '../../shared/types';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onUpdate: (itemId: number, updates: UpdateShoppingItem) => void;
  onDelete: (itemId: number) => void;
}

export default function ShoppingItem({ item, onUpdate, onDelete }: ShoppingItemProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [priceInput, setPriceInput] = useState(item.price > 0 ? item.price.toString() : '');
  const [weightInput, setWeightInput] = useState(item.weight_kg > 0 ? item.weight_kg.toString() : '');
  const [pricePerKgInput, setPricePerKgInput] = useState(item.price_per_kg > 0 ? item.price_per_kg.toString() : '');

  const handleNameEdit = () => {
    if (editName.trim() && editName !== item.name) {
      onUpdate(item.id, { name: editName.trim() });
    }
    setIsEditingName(false);
    setEditName(item.name);
  };

  const handleToggleCart = () => {
    if (item.is_in_cart && item.quantity > 1) {
      // Se está no carrinho e tem mais de 1 unidade, apenas reduz a quantidade
      onUpdate(item.id, { quantity: item.quantity - 1 });
    } else if (item.is_in_cart) {
      // Se está no carrinho e tem 1 unidade, remove do carrinho
      onUpdate(item.id, { is_in_cart: false, quantity: 1 });
    } else {
      // Se não está no carrinho, adiciona
      onUpdate(item.id, { is_in_cart: true, quantity: 1 });
    }
  };

  const handlePriceChange = (value: string) => {
    setPriceInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate(item.id, { price: numValue });
    } else if (value === '') {
      onUpdate(item.id, { price: 0 });
    }
  };

  const handleWeightChange = (value: string) => {
    setWeightInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate(item.id, { weight_kg: numValue });
    } else if (value === '') {
      onUpdate(item.id, { weight_kg: 0 });
    }
  };

  const handlePricePerKgChange = (value: string) => {
    setPricePerKgInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate(item.id, { price_per_kg: numValue });
    } else if (value === '') {
      onUpdate(item.id, { price_per_kg: 0 });
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    onUpdate(item.id, { quantity: newQuantity });
  };

  const handleToggleWeightMode = () => {
    const newIsWeightMode = !item.is_sold_by_weight;
    
    // Reset dos campos ao trocar modo
    if (newIsWeightMode) {
      // Mudando para peso: resetar campos de unidade
      setPriceInput('');
      setWeightInput('1.0');
      setPricePerKgInput('');
      onUpdate(item.id, { 
        is_sold_by_weight: true,
        weight_kg: 1.0,
        price_per_kg: 0,
        price: 0,
        quantity: 1
      });
    } else {
      // Mudando para unidade: resetar campos de peso
      setWeightInput('');
      setPricePerKgInput('');
      setPriceInput('');
      onUpdate(item.id, { 
        is_sold_by_weight: false,
        weight_kg: 0,
        price_per_kg: 0,
        price: 0,
        quantity: 1
      });
    }
  };

  const totalItemPrice = item.is_sold_by_weight 
    ? item.weight_kg * item.price_per_kg 
    : item.price * item.quantity;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
      item.is_in_cart 
        ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border-emerald-400/40 shadow-emerald-500/20' 
        : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15'
    }`}>
      {/* Glow effect for items in cart */}
      {item.is_in_cart && (
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-xl"></div>
      )}
      
      <div className="relative p-4">
        {/* Simple layout for items not in cart */}
        {!item.is_in_cart ? (
          <div className="flex items-center gap-4">
            {/* Modern Checkbox */}
            <button
              onClick={handleToggleCart}
              className="flex-shrink-0 w-8 h-8 rounded-xl border-2 border-white/30 hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 group/btn"
              title="Adicionar ao carrinho"
            >
              <div className="w-3 h-3 rounded-full bg-white/20 group-hover/btn:bg-emerald-400/60 transition-all duration-200"></div>
            </button>

            {/* Item Name with better typography */}
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleNameEdit}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameEdit()}
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:border-emerald-400/60 focus:bg-white/25 text-base font-medium transition-all duration-200"
                  autoFocus
                />
              ) : (
                <div 
                  className="text-white font-medium cursor-pointer hover:text-emerald-200 transition-colors text-base truncate"
                  onClick={() => setIsEditingName(true)}
                  title={item.name}
                >
                  {item.name}
                </div>
              )}
            </div>

            {/* Modern Action Buttons */}
            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setIsEditingName(true)}
                className="p-2.5 text-white/60 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                title="Editar nome"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2.5 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                title="Remover item"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Enhanced layout for items in cart */
          <div className="space-y-4">
            {/* Header with name and modern checkbox */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleCart}
                className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 border-2 border-emerald-400/60 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-emerald-500/40"
                title={item.quantity > 1 ? 'Reduzir quantidade' : 'Remover do carrinho'}
              >
                <Check className="w-4 h-4 font-bold drop-shadow-sm" />
              </button>

              <div className="flex-1 min-w-0">
                {isEditingName ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleNameEdit}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameEdit()}
                    className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:border-emerald-400/60 focus:bg-white/25 text-base font-medium transition-all duration-200"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <div 
                      className="text-white/90 font-medium cursor-pointer hover:text-emerald-200 transition-colors text-base line-through decoration-emerald-400/60 decoration-2 truncate"
                      onClick={() => setIsEditingName(true)}
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    {item.is_sold_by_weight && (
                      <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 rounded-lg px-2 py-1">
                        <Scale className="w-3 h-3 text-amber-300" />
                        <span className="text-amber-200 text-xs font-medium">Peso</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modern action buttons */}
              <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-2.5 text-white/60 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Editar nome"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-2.5 text-white/60 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Remover item"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modern Controls section */}
            <div className="space-y-3">
              {/* Weight mode toggle with better design */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleToggleWeightMode}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium border ${
                    item.is_sold_by_weight 
                      ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30 shadow-amber-500/20' 
                      : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white hover:border-white/30'
                  }`}
                  title={item.is_sold_by_weight ? 'Mudar para por unidade' : 'Mudar para por peso (kg)'}
                >
                  <Scale className="w-4 h-4" />
                  <span>{item.is_sold_by_weight ? 'Por Peso (kg)' : 'Por Unidade'}</span>
                </button>
              </div>

              {/* Price and quantity controls with improved responsive design */}
              <div className="space-y-3">
                {item.is_sold_by_weight ? (
                  /* Layout para venda por peso */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Weight Input */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 hover:bg-white/15 transition-all duration-200">
                      <label className="block text-white/60 text-xs font-medium mb-2">Peso</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={weightInput}
                          onChange={(e) => handleWeightChange(e.target.value)}
                          className="w-full bg-transparent text-white text-base font-medium focus:outline-none placeholder-white/40 text-center"
                          placeholder="1.0"
                          style={{ maxWidth: '80px' }}
                        />
                        <span className="text-white/70 text-sm font-medium whitespace-nowrap">kg</span>
                      </div>
                    </div>

                    {/* Price per kg Input */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 hover:bg-white/15 transition-all duration-200">
                      <label className="block text-white/60 text-xs font-medium mb-2">Preço/kg</label>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70 text-sm whitespace-nowrap">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={pricePerKgInput}
                          onChange={(e) => handlePricePerKgChange(e.target.value)}
                          className="w-full bg-transparent text-white text-base font-medium focus:outline-none placeholder-white/40 text-center"
                          placeholder="0.00"
                          style={{ maxWidth: '80px' }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Layout para venda por unidade */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Quantity Controls */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 hover:bg-white/15 transition-all duration-200">
                      <label className="block text-white/60 text-xs font-medium mb-2">Quantidade</label>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-white text-lg font-bold min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Unit Price Input */}
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 hover:bg-white/15 transition-all duration-200">
                      <label className="block text-white/60 text-xs font-medium mb-2">Preço Unit.</label>
                      <div className="flex items-center gap-2 justify-center">
                        <span className="text-white/70 text-sm whitespace-nowrap">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={priceInput}
                          onChange={(e) => handlePriceChange(e.target.value)}
                          className="w-full bg-transparent text-white text-base font-medium focus:outline-none placeholder-white/40 text-center"
                          placeholder="0.00"
                          style={{ maxWidth: '80px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Price with prominent display - sempre visível quando há valor */}
                {totalItemPrice > 0 && (
                  <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 rounded-xl p-4 shadow-emerald-500/20 text-center">
                    <label className="block text-emerald-200/80 text-xs font-medium mb-1">Total</label>
                    <div className="text-emerald-200 text-xl font-bold">
                      R$ {totalItemPrice.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
