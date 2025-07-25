import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddItemFormProps {
  onAddItem: (name: string) => void;
  disabled?: boolean;
}

export default function AddItemForm({ onAddItem, disabled }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAddItem(name.trim());
      setName('');
    }
  };

  return (
    <div className="mb-8">
      {/* Label acima do input - sem sobreposição */}
      <label className="block text-white/80 text-sm font-medium mb-3 px-2">
        ➕ Adicionar Novo Produto
      </label>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Input limpo sem label flutuante */}
          <div className={`relative bg-white/10 backdrop-blur-md border-2 rounded-2xl transition-all duration-300 ${
            isFocused 
              ? 'border-emerald-400/60 bg-white/15 shadow-lg shadow-emerald-500/20' 
              : 'border-white/20 hover:border-white/30 hover:bg-white/15'
          }`}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Digite o nome do produto..."
              disabled={disabled}
              className="w-full bg-transparent px-6 py-4 pr-20 text-white placeholder-white/60 focus:outline-none text-base font-medium disabled:opacity-50"
            />
            
            {/* Botão de submit integrado */}
            <button
              type="submit"
              disabled={disabled || !name.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center ${
                name.trim() && !disabled
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30 hover:scale-110 hover:shadow-emerald-500/40'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
              title="Adicionar produto"
            >
              <Plus className={`w-5 h-5 transition-all duration-300 ${
                name.trim() && !disabled ? 'text-white rotate-0' : 'text-white/40 rotate-45'
              }`} />
            </button>
          </div>
        </div>
        
        {/* Dica de uso */}
        <div className="mt-3 px-2">
          <p className="text-white/50 text-sm">
            💡 Dica: Pressione Enter para adicionar rapidamente
          </p>
        </div>
      </form>
    </div>
  );
}
