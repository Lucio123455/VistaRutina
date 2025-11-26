import React, { useState, useEffect } from 'react';
import { WorkoutPlan } from './types';
import { RoutineCard } from './components/RoutineCard';
import { Dumbbell, ChevronLeft, ChevronRight, AlertCircle, FileJson } from 'lucide-react';

const App: React.FC = () => {
  const [routine, setRoutine] = useState<WorkoutPlan | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoutineFromUrl = () => {
      try {
        // Intentamos obtener el string de datos de varios lugares por robustez
        // 1. Pathname (lo que pediste): site.com/[{...}]
        // 2. Search query: site.com/?data=[{...}]
        // 3. Hash: site.com/#[{...}] (A veces más seguro para evitar errores 404 en servidores estrictos)
        let rawData = window.location.pathname.substring(1);
        
        if (!rawData || rawData === '/') {
           // Si no hay nada en el path, miramos el search o hash
           rawData = window.location.search.substring(1) || window.location.hash.substring(1);
        }

        if (!rawData || rawData === '/') {
          setLoading(false);
          return;
        }

        // Limpieza básica: a veces viene con 'data=' si usan query params
        if (rawData.startsWith('data=')) {
            rawData = rawData.substring(5);
        }

        let parsedData;
        try {
            // Intento 1: Decodificar y parsear
            const decodedData = decodeURIComponent(rawData);
            parsedData = JSON.parse(decodedData);
        } catch (e) {
            try {
                // Intento 2: Quizás el navegador ya lo decodificó, intentar parsear directo
                parsedData = JSON.parse(rawData);
            } catch (e2) {
                console.error("Error parsing JSON", e2);
                throw new Error("El formato de la URL no es un JSON válido.");
            }
        }

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setRoutine(parsedData);
          setError(null);
        } else {
          setError("El formato de la rutina no es válido la concha de tu madre. Debe ser un arreglo JSON.");
        }
      } catch (err) {
        console.error(err);
        if (window.location.pathname.length > 1 || window.location.hash.length > 1) {
            setError("No se pudo leer la rutina. Asegúrate de copiar todo el código JSON correctamente en la URL.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadRoutineFromUrl();
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (routine && currentIndex < routine.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Estado: Error o Sin Datos
  if (!routine) {
    return (
      <div className="flex flex-col h-full bg-gray-50 p-6 items-center justify-center text-center">
         <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                {error ? <AlertCircle size={32} /> : <FileJson size={32} />}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {error ? "Error al cargar" : "Esperando Rutina"}
            </h2>
            
            <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                {error 
                  ? error 
                  : "Para ver tu rutina, pega el código JSON al final de la dirección web."
                }
            </p>

            {!error && (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1 text-left">Opción 1 (Recomendada)</p>
                        <div className="text-xs text-left font-mono text-gray-600 break-all">
                            tu-sitio.app/<span className="text-indigo-600 font-bold">[&#123;"day":"Lunes"...&#125;]</span>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-1 text-left">Opción 2 (Si falla la anterior)</p>
                        <div className="text-xs text-left font-mono text-gray-600 break-all">
                            tu-sitio.app/<span className="text-pink-500 font-bold">#</span><span className="text-indigo-600 font-bold">[&#123;"day":"Lunes"...&#125;]</span>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>
    );
  }

  const currentRoutine = routine[currentIndex];

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex-none bg-white border-b border-gray-100 z-10">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Mi Rutina</h1>
                <p className="text-gray-500 text-xs mt-1">
                  Día {currentIndex + 1} de {routine.length}
                </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                <Dumbbell size={20} />
            </div>
        </div>
      </header>

      {/* Main Content - Single Card Full Screen */}
      <main className="flex-1 overflow-hidden p-4 flex flex-col justify-center relative">
        <div className="w-full h-full max-w-md mx-auto relative">
           <RoutineCard routine={currentRoutine} />
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <div className="flex-none bg-white border-t border-gray-200 p-4 safe-area-pb">
        <div className="flex items-center justify-between max-w-md mx-auto gap-4">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-4 rounded-2xl flex-1 flex items-center justify-center transition-all duration-200 ${
              currentIndex === 0 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95'
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-1.5">
            {routine.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-indigo-600 w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            disabled={currentIndex === routine.length - 1}
            className={`p-4 rounded-2xl flex-1 flex items-center justify-center transition-all duration-200 ${
              currentIndex === routine.length - 1 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                : 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;