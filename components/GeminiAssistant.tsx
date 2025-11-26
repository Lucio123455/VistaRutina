import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Sparkles, X } from 'lucide-react';
import { transcribeAudio, modifyRoutineWithGemini } from '../services/geminiService';
import { WorkoutPlan } from '../types';

interface GeminiAssistantProps {
  currentRoutine: WorkoutPlan;
  onRoutineUpdate: (newRoutine: WorkoutPlan) => void;
}

export const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ currentRoutine, onRoutineUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup media recorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Typically webm in browsers
        await handleAudioProcess(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTranscription(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No se pudo acceder al micrófono. Por favor verifica los permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleAudioProcess = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      // 1. Transcribe
      const text = await transcribeAudio(audioBlob);
      setTranscription(text);

      // 2. If we have text, try to update the routine
      if (text.trim().length > 5) {
         const newRoutine = await modifyRoutineWithGemini(currentRoutine, text);
         onRoutineUpdate(newRoutine);
      }

    } catch (error) {
      console.error(error);
      alert("Ocurrió un error procesando tu solicitud con Gemini.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setTranscription(null);
    setIsProcessing(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-2xl transition-all duration-300 transform active:scale-95 flex items-center gap-2 ${
          isRecording 
            ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        } ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={24} />
        ) : isRecording ? (
          <Square size={24} fill="currentColor" />
        ) : (
          <Mic size={24} />
        )}
      </button>

      {/* Status / Transcription Toast */}
      {(transcription || isProcessing || isRecording) && (
        <div className="fixed bottom-24 left-4 right-4 z-40">
           <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-indigo-100 max-w-md mx-auto">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                    <Sparkles size={16} />
                    <span>Gemini Assistant</span>
                </div>
                {!isProcessing && !isRecording && (
                    <button onClick={reset} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                )}
              </div>
              
              <div className="text-gray-700 text-sm">
                {isRecording && "Escuchando... (Toca el botón rojo para terminar)"}
                {isProcessing && !transcription && "Transcribiendo audio..."}
                {isProcessing && transcription && "Actualizando rutina..."}
                {!isProcessing && !isRecording && transcription && (
                    <>
                        <p className="italic text-gray-500 mb-2">"{transcription}"</p>
                        <p className="text-green-600 font-medium text-xs">¡Rutina actualizada exitosamente!</p>
                    </>
                )}
              </div>
           </div>
        </div>
      )}
    </>
  );
};