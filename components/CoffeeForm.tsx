
import React, { useState, useEffect, useRef } from 'react';
import { CoffeeLog } from '../types';
import { X, Smile, Star } from 'lucide-react';

interface CoffeeFormProps {
  initialData?: CoffeeLog;
  onSave: (data: Omit<CoffeeLog, 'id' | 'date' | 'isFavorite'>) => void;
  onClose: () => void;
}

const CoffeeForm: React.FC<CoffeeFormProps> = ({ initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    roaster: '',
    year: new Date().getFullYear(),
    rating: 5,
    notes: '',
    recipe: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        origin: initialData.origin,
        roaster: initialData.roaster,
        year: initialData.year,
        rating: initialData.rating,
        notes: initialData.notes,
        recipe: initialData.recipe || '',
        imageUrl: initialData.imageUrl || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/20 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 my-8">
        <div className="flex justify-between items-center px-10 pt-10 pb-6">
          <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            {initialData ? 'Editar registro' : 'Nuevo café'}
          </h2>
          <button onClick={onClose} className="p-2 text-neutral-300 hover:text-neutral-900 transition-colors">
            <X size={28} strokeWidth={2} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-8">
          <div className="space-y-7">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 ml-1">Nombre o Variedad</label>
              <input 
                required
                type="text"
                className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-neutral-200 outline-none transition-all placeholder:text-neutral-300 text-neutral-900 font-medium"
                placeholder="Ej. Sidra Natural, Bourbon..."
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 ml-1">Origen</label>
                <input 
                  required
                  type="text"
                  className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-neutral-200 outline-none transition-all placeholder:text-neutral-300 text-neutral-900 font-medium"
                  placeholder="País / Región"
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 ml-1">Tostador</label>
                <input 
                  required
                  type="text"
                  className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-neutral-200 outline-none transition-all placeholder:text-neutral-300 text-neutral-900 font-medium"
                  placeholder="Nombre"
                  value={formData.roaster}
                  onChange={(e) => setFormData({...formData, roaster: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 ml-1">Año</label>
                <input 
                  required
                  type="number"
                  className="w-full px-6 py-4 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-neutral-200 outline-none transition-all text-neutral-900 font-medium"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 ml-1">Satisfacción (Rating)</label>
                <div className="flex items-center h-[56px] px-5 bg-neutral-50 rounded-2xl gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, rating: level})}
                      className="p-1.5 transition-all hover:scale-110 active:scale-90"
                    >
                      <Smile 
                        size={22} 
                        strokeWidth={2.5}
                        className={`${level <= formData.rating ? 'fill-orange-400 text-white' : 'text-neutral-200'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 ml-1">Notas de Cata</label>
              <textarea 
                className="w-full px-6 py-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-neutral-200 outline-none transition-all min-h-[100px] resize-none text-neutral-900 font-medium placeholder:text-neutral-300"
                placeholder="Describe los matices, acidez, cuerpo..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-[0.2em] font-extrabold text-neutral-400 ml-1">Receta de Preparación</label>
              <textarea 
                className="w-full px-6 py-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-neutral-200 outline-none transition-all min-h-[100px] resize-none text-neutral-900 font-medium placeholder:text-neutral-300"
                placeholder="Ej. V60: 18g café, 290ml agua a 94ºC, vertido en 3 fases..."
                value={formData.recipe}
                onChange={(e) => setFormData({...formData, recipe: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-neutral-900 text-white rounded-3xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-[0.98] transition-all shadow-xl shadow-neutral-100"
          >
            {initialData ? 'Actualizar' : 'Guardar registro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CoffeeForm;
