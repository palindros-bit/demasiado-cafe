
import React, { useState, useRef, useEffect } from 'react';
import { CoffeeLog } from '../types';
import { 
  Smile, Heart, Share2, MapPin, Edit2, Trash2, Sparkles, ChefHat, 
  ChevronDown, ChevronUp, Copy, MessageCircle, ExternalLink,
  Calendar, Flag
} from 'lucide-react';

interface CoffeeCardProps {
  coffee: CoffeeLog;
  onToggleFavorite: (id: string) => void;
  onShare: (coffee: CoffeeLog, type?: 'system' | 'whatsapp' | 'copy') => void;
  onDelete: (id: string) => void;
  onEdit: (coffee: CoffeeLog) => void;
  onFilterClick: (type: 'origin' | 'roaster', value: string) => void;
}

const getFlagEmoji = (countryName: string) => {
  const flags: Record<string, string> = {
    'Etiopía': '🇪🇹',
    'Ethiopia': '🇪🇹',
    'Brasil': '🇧🇷',
    'Brazil': '🇧🇷',
    'Colombia': '🇨🇴',
    'Guatemala': '🇬🇹',
    'Honduras': '🇭🇳',
    'Kenia': '🇰🇪',
    'Kenya': '🇰🇪',
    'Ruanda': '🇷🇼',
    'Rwanda': '🇷🇼',
    'Perú': '🇵🇪',
    'Peru': '🇵🇪',
    'Costa Rica': '🇨🇷',
    'Panamá': '🇵🇦',
    'Panama': '🇵🇦',
    'El Salvador': '🇸🇻',
    'Nicaragua': '🇳🇮',
    'India': '🇮🇳',
    'Indonesia': '🇮🇩',
    'Uganda': '🇺🇬',
    'México': '🇲🇽',
    'Mexico': '🇲🇽'
  };

  // Find if any key matches or is contained in the origin string
  const found = Object.keys(flags).find(key => 
    countryName.toLowerCase().includes(key.toLowerCase())
  );
  
  return found ? flags[found] : null;
};

const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee, onToggleFavorite, onShare, onDelete, onEdit, onFilterClick }) => {
  const [showRecipe, setShowRecipe] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const flagEmoji = getFlagEmoji(coffee.origin);

  return (
    <div className="bg-white rounded-3xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)] border border-neutral-100 overflow-hidden group">
      {/* Header section without image */}
      <div className="p-7 pb-0 flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <button 
            onClick={() => onFilterClick('roaster', coffee.roaster)}
            className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 mb-1.5 block hover:text-neutral-900 transition-colors text-left"
          >
            {coffee.roaster}
          </button>
          <h3 className="text-xl font-bold text-neutral-900 leading-tight truncate pr-4">
            {coffee.name}
          </h3>
        </div>
        <div className="flex flex-col gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={() => onToggleFavorite(coffee.id)}
            className={`p-2 rounded-full transition-all ${coffee.isFavorite ? 'bg-orange-500 text-white' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`}
          >
            <Heart size={14} fill={coffee.isFavorite ? 'currentColor' : 'none'} strokeWidth={coffee.isFavorite ? 0 : 2} />
          </button>
          
          <div className="relative" ref={shareMenuRef}>
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className={`p-2 rounded-full transition-all shadow-sm ${showShareMenu ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-neutral-400 hover:bg-neutral-100'}`}
            >
              <Share2 size={14} />
            </button>
            
            {showShareMenu && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-2xl border border-neutral-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => { onShare(coffee, 'whatsapp'); setShowShareMenu(false); }}
                  className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 flex items-center gap-3 transition-colors"
                >
                  <MessageCircle size={14} className="text-emerald-500" />
                  Compartir WhatsApp
                </button>
                <button 
                  onClick={() => { onShare(coffee, 'copy'); setShowShareMenu(false); }}
                  className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 flex items-center gap-3 transition-colors"
                >
                  <Copy size={14} className="text-amber-500" />
                  Copiar en Notas
                </button>
                <button 
                  onClick={() => { onShare(coffee, 'system'); setShowShareMenu(false); }}
                  className="w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400 hover:bg-neutral-50 hover:text-neutral-900 flex items-center gap-3 border-t border-neutral-50 mt-1 transition-colors"
                >
                  <ExternalLink size={14} />
                  Otras opciones
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-7 pt-4">
        <div className="flex flex-wrap gap-4 mb-6">
          <button 
            onClick={() => onFilterClick('origin', coffee.origin)}
            className="flex items-center gap-2 text-xs text-neutral-600 font-bold hover:text-neutral-900 transition-colors group/tag bg-neutral-50 px-3 py-1.5 rounded-full"
          >
            {flagEmoji ? (
              <span className="text-base leading-none">{flagEmoji}</span>
            ) : (
              <Flag size={12} className="text-neutral-400 group-hover/tag:text-orange-500 transition-colors" />
            )}
            {coffee.origin}
          </button>
          
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold px-3 py-1.5">
            <Calendar size={12} className="text-neutral-300" />
            {coffee.year}
          </div>

          <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-black ml-auto">
            <Smile size={12} className="fill-orange-400 text-white" strokeWidth={2.5} />
            {coffee.rating.toFixed(1)}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-300 mb-1.5 block">Notas de Cata</span>
            <p className="text-[13px] text-neutral-600 leading-relaxed font-normal line-clamp-3 italic">
              "{coffee.notes}"
            </p>
          </div>

          {coffee.recipe && (
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
              <button 
                onClick={() => setShowRecipe(!showRecipe)}
                className="w-full flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-extrabold text-neutral-500"
              >
                <span className="flex items-center gap-2">
                  <ChefHat size={14} className="text-neutral-400" />
                  Receta
                </span>
                {showRecipe ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showRecipe && (
                <p className="mt-3 text-[12px] text-neutral-600 leading-relaxed font-medium whitespace-pre-wrap animate-in fade-in slide-in-from-top-1 duration-300">
                  {coffee.recipe}
                </p>
              )}
            </div>
          )}
        </div>
        
        {coffee.aiInsights && (
          <div className="mt-6 py-6 border-t border-neutral-50">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.25em] font-black text-orange-600 mb-2">
              <Sparkles size={10} />
              Inteligencia
            </div>
            <p className="text-[11px] text-neutral-500 italic leading-relaxed font-medium">
              "{coffee.aiInsights}"
            </p>
          </div>
        )}

        <div className="flex justify-end gap-1.5 py-4 border-t border-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={() => onEdit(coffee)} className="p-2 text-neutral-300 hover:text-neutral-900 transition-colors">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(coffee.id)} className="p-2 text-neutral-300 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;
