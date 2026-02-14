
import React, { useState, useEffect, useMemo } from 'react';
import { CoffeeLog, FilterState, SortOption } from './types';
import CoffeeCard from './components/CoffeeCard';
import CoffeeForm from './components/CoffeeForm';
import { getCoffeeInsights } from './services/geminiService';
import { COFFEE_2021_DATA } from './constants';
// Removed Twitter from imports
import { Search, Plus, Filter, Sparkles, Import, X, Instagram } from 'lucide-react';

const App: React.FC = () => {
  const [coffees, setCoffees] = useState<CoffeeLog[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoffee, setEditingCoffee] = useState<CoffeeLog | undefined>();
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [hasImported2021, setHasImported2021] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    origin: '',
    roaster: '',
    year: '',
  });
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('demasiado_cafe_logs');
    const imported = localStorage.getItem('demasiado_cafe_imported_2021');
    if (saved) {
      try {
        setCoffees(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved coffees");
      }
    }
    if (imported) setHasImported2021(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('demasiado_cafe_logs', JSON.stringify(coffees));
  }, [coffees]);

  const import2021Data = () => {
    const newLogs: CoffeeLog[] = COFFEE_2021_DATA.map((item, index) => ({
      ...item,
      id: `2021-${index}`,
      isFavorite: false,
      date: new Date(2021, 0, 1 + index).toISOString(),
      // Fallback only if imageUrl is missing in constants
      imageUrl: item.imageUrl || `https://source.unsplash.com/featured/?specialty-coffee,roastery&sig=${index}`
    }));

    setCoffees(prev => [...newLogs, ...prev]);
    setHasImported2021(true);
    localStorage.setItem('demasiado_cafe_imported_2021', 'true');
  };

  const handleAddOrEditCoffee = async (formData: Omit<CoffeeLog, 'id' | 'date' | 'isFavorite'>) => {
    setLoadingInsights(true);
    
    let aiInsights = undefined;
    if (!editingCoffee || (editingCoffee.notes !== formData.notes)) {
      aiInsights = await getCoffeeInsights(formData.origin, formData.roaster, formData.notes) || undefined;
    } else {
      aiInsights = editingCoffee.aiInsights;
    }

    if (editingCoffee) {
      setCoffees(prev => prev.map(c => 
        c.id === editingCoffee.id 
          ? { ...c, ...formData, aiInsights } 
          : c
      ));
    } else {
      const newCoffee: CoffeeLog = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        isFavorite: false,
        aiInsights,
      };
      setCoffees(prev => [newCoffee, ...prev]);
    }
    
    setLoadingInsights(false);
    setIsFormOpen(false);
    setEditingCoffee(undefined);
  };

  const toggleFavorite = (id: string) => {
    setCoffees(prev => prev.map(c => 
      c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
    ));
  };

  const deleteCoffee = (id: string) => {
    if (window.confirm('¿Eliminar registro?')) {
      setCoffees(prev => prev.filter(c => c.id !== id));
    }
  };

  const shareCoffee = async (coffee: CoffeeLog, type: 'system' | 'whatsapp' | 'copy' = 'system') => {
    const recipeText = coffee.recipe ? `\n\n📖 Receta de Preparación:\n${coffee.recipe}` : '';
    const shareText = `☕ ${coffee.name}\n📍 Origen: ${coffee.origin}\n🏢 Tostador: ${coffee.roaster}\n⭐️ Calificación: ${coffee.rating}/5\n\n📝 Notas de Cata:\n${coffee.notes}${recipeText}\n\nRegistrado en Demasiado Café.`;
    
    if (type === 'whatsapp') {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }

    if (type === 'copy') {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('¡Copiado al portapapeles! Ahora puedes pegarlo en tus Notas.');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      return;
    }

    // Default 'system' share
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Coffee: ${coffee.name}`,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback for desktop browsers without Share API
      await navigator.clipboard.writeText(shareText);
      alert('¡Copiado al portapapeles!');
    }
  };

  const handleTagClick = (type: 'origin' | 'roaster', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value === prev[type] ? '' : value // Toggle filter if clicking same value
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredAndSortedCoffees = useMemo(() => {
    let result = coffees.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                          c.notes.toLowerCase().includes(filters.search.toLowerCase());
      const matchesOrigin = !filters.origin || c.origin.toLowerCase().includes(filters.origin.toLowerCase());
      const matchesRoaster = !filters.roaster || c.roaster.toLowerCase().includes(filters.roaster.toLowerCase());
      const matchesYear = !filters.year || c.year.toString() === filters.year;
      
      return matchesSearch && matchesOrigin && matchesRoaster && matchesYear;
    });

    return result.sort((a, b) => {
      if (sortOption === 'newest') return Number(new Date(b.date)) - Number(new Date(a.date));
      if (sortOption === 'oldest') return Number(new Date(a.date)) - Number(new Date(b.date));
      if (sortOption === 'rating') return Number(b.rating) - Number(a.rating);
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [coffees, filters, sortOption]);

  const uniqueOrigins = Array.from(new Set(coffees.map(c => c.origin))).sort();
  const uniqueRoasters = Array.from(new Set(coffees.map(c => c.roaster))).sort();
  const uniqueYears = Array.from(new Set(coffees.map(c => c.year))).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-orange-100 antialiased">
      <header className="sticky top-0 z-30 glass border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tighter text-neutral-900 italic cursor-pointer" onClick={() => window.location.reload()}>
            demasiado café
          </h1>
          <button 
            onClick={() => {
              setEditingCoffee(undefined);
              setIsFormOpen(true);
            }}
            className="px-7 py-3 bg-neutral-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-neutral-100"
          >
            <Plus size={16} strokeWidth={3} />
            Nuevo Registro
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-16 pb-32">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-300" size={20} />
            <input 
              type="text"
              placeholder="Buscar por variedad, origen o cata..."
              className="w-full pl-16 pr-8 py-5 bg-white rounded-[1.5rem] border border-neutral-100 shadow-sm outline-none focus:ring-2 focus:ring-neutral-100 transition-all placeholder:text-neutral-300 text-neutral-800 font-medium"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-10 py-5 rounded-[1.5rem] border transition-all text-xs font-black uppercase tracking-widest ${showFilters || filters.origin || filters.roaster || filters.year ? 'bg-neutral-900 border-neutral-900 text-white shadow-xl' : 'bg-white border-neutral-100 text-neutral-500 hover:border-neutral-200'}`}
            >
              <Filter size={16} strokeWidth={3} />
              Filtros
            </button>
            <select 
              className="appearance-none bg-white border border-neutral-100 px-10 py-5 pr-14 rounded-[1.5rem] outline-none text-xs font-black uppercase tracking-widest text-neutral-500 hover:border-neutral-200 shadow-sm transition-all"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="newest">Recientes</option>
              <option value="oldest">Histórico</option>
              <option value="rating">Top Rated</option>
              <option value="name">A - Z</option>
            </select>
          </div>
        </div>

        {(filters.origin || filters.roaster || filters.year) && (
          <div className="flex flex-wrap gap-2 mb-8 animate-in fade-in slide-in-from-left-2 duration-300">
            {filters.origin && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-100">
                Origen: {filters.origin}
                <button onClick={() => setFilters({...filters, origin: ''})} className="hover:text-orange-900"><X size={12} strokeWidth={3} /></button>
              </span>
            )}
            {filters.roaster && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-neutral-200">
                Tostador: {filters.roaster}
                <button onClick={() => setFilters({...filters, roaster: ''})} className="hover:text-neutral-900"><X size={12} strokeWidth={3} /></button>
              </span>
            )}
            {filters.year && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-neutral-200">
                Año: {filters.year}
                <button onClick={() => setFilters({...filters, year: ''})} className="hover:text-neutral-900"><X size={12} strokeWidth={3} /></button>
              </span>
            )}
            <button 
              onClick={() => setFilters({search: '', origin: '', roaster: '', year: ''})}
              className="text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-red-500 transition-colors ml-2"
            >
              Borrar todo
            </button>
          </div>
        )}

        {!hasImported2021 && (
          <div className="mb-12 p-1 bg-white border border-neutral-100 rounded-[1.5rem] flex items-center justify-between pl-6 overflow-hidden">
            <div className="flex items-center gap-3">
              <Sparkles className="text-orange-500 animate-pulse" size={18} />
              <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Recuperar archivo histórico #Coffee2021</p>
            </div>
            <button 
              onClick={import2021Data}
              className="flex items-center gap-2 px-6 py-3 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-[1rem]"
            >
              <Import size={14} />
              Importar listado
            </button>
          </div>
        )}

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-20 p-12 bg-white border border-neutral-100 rounded-[2.5rem] shadow-2xl shadow-neutral-100/50 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-400">Origen</label>
              <select 
                className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-neutral-700 outline-none"
                value={filters.origin}
                onChange={(e) => setFilters({...filters, origin: e.target.value})}
              >
                <option value="">Cualquier origen</option>
                {uniqueOrigins.map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-400">Tostador</label>
              <select 
                className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-neutral-700 outline-none"
                value={filters.roaster}
                onChange={(e) => setFilters({...filters, roaster: e.target.value})}
              >
                <option value="">Cualquier marca</option>
                {uniqueRoasters.map(roaster => (
                  <option key={roaster} value={roaster}>{roaster}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-400">Año de Cosecha</label>
              <select 
                className="w-full bg-neutral-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-neutral-700 outline-none"
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
              >
                <option value="">Todos los años</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({search: '', origin: '', roaster: '', year: ''})}
                className="w-full py-3.5 border border-neutral-100 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-neutral-300 hover:text-neutral-900 hover:border-neutral-900 transition-all"
              >
                Resetear
              </button>
            </div>
          </div>
        )}

        {filteredAndSortedCoffees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredAndSortedCoffees.map(coffee => (
              <CoffeeCard 
                key={coffee.id}
                coffee={coffee}
                onToggleFavorite={toggleFavorite}
                onShare={shareCoffee}
                onDelete={deleteCoffee}
                onEdit={(c) => {
                  setEditingCoffee(c);
                  setIsFormOpen(true);
                }}
                onFilterClick={handleTagClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-1 bg-neutral-100 mb-8 rounded-full"></div>
            <p className="text-xl font-medium text-neutral-300 tracking-tight italic">Sin resultados en el diario</p>
          </div>
        )}
      </main>

      {loadingInsights && (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-700">
          <div className="relative mb-10 scale-125">
            <div className="w-24 h-24 border-[1px] border-neutral-100 rounded-full"></div>
            <div className="absolute top-0 w-24 h-24 border-t-2 border-neutral-900 rounded-full animate-spin"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-900" size={32} strokeWidth={1.5} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.5em] font-black text-neutral-900 animate-pulse">Analizando perfil aromático</p>
        </div>
      )}

      {isFormOpen && (
        <CoffeeForm 
          initialData={editingCoffee}
          onSave={handleAddOrEditCoffee}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCoffee(undefined);
          }}
        />
      )}
      
      <footer className="max-w-7xl mx-auto px-8 py-24 flex flex-col items-center gap-10 border-t border-neutral-100">
        <div className="w-px h-16 bg-gradient-to-b from-neutral-200 to-transparent"></div>
        <div className="flex flex-col items-center gap-3">
          <p className="text-[11px] uppercase tracking-[0.4em] font-black text-neutral-900">Demasiado Café</p>
          <div className="flex items-center gap-4 text-neutral-300">
            <a 
              href="https://instagram.com/lorenaeffe" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-neutral-900 transition-colors flex items-center gap-2 group"
            >
              <Instagram size={14} className="group-hover:text-orange-500 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">@lorenaeffe</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
