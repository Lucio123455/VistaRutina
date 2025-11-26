import React from 'react';
import { DayRoutine } from '../types';
import { Dumbbell, Calendar, Repeat, Activity } from 'lucide-react';

interface RoutineCardProps {
  routine: DayRoutine;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({ routine }) => {
  return (
    <div className="w-full h-full flex flex-col animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white relative overflow-hidden flex-none">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <Dumbbell size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 opacity-90">
                    <Calendar size={16} />
                    <span className="uppercase tracking-wider text-xs font-bold">{routine.day}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">{routine.title}</h2>
            </div>
        </div>

        {/* Exercises List */}
        <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
          <div className="space-y-3">
            {routine.exercises.map((exercise, idx) => (
              <div key={idx} className="flex items-center justify-between group p-4 rounded-2xl bg-gray-50 hover:bg-indigo-50/50 transition-colors border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white text-indigo-600 shadow-sm flex items-center justify-center flex-shrink-0 font-bold text-lg border border-indigo-50">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{exercise.name}</h3>
                    <div className="flex gap-4 text-xs text-gray-500 mt-1.5">
                        <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm">
                          <Repeat size={12} className="text-indigo-500"/> 
                          {exercise.sets} Series
                        </span>
                        <span className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md shadow-sm">
                          <Activity size={12} className="text-purple-500"/> 
                          {exercise.reps} Reps
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100 flex-none">
             <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
               {routine.exercises.length} Ejercicios Totales
             </span>
        </div>
      </div>
    </div>
  );
};