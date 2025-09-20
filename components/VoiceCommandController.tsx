import React, { useState, useEffect } from 'react';
import { MicIcon } from './icons/MicIcon';

interface VoiceCommandControllerProps {
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  hasSupport: boolean;
}

export const VoiceCommandController: React.FC<VoiceCommandControllerProps> = ({
  isListening,
  transcript,
  error,
  startListening,
  stopListening,
  hasSupport,
}) => {
  const [visibleError, setVisibleError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setVisibleError(error);
      const timer = setTimeout(() => {
        setVisibleError(null);
      }, 5000); // Hide error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!hasSupport) {
    return null;
  }

  return (
    <>
      {/* Listening Modal */}
      {isListening && (
        <div
          className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center flex-col"
          onClick={stopListening}
          aria-modal="true"
          role="dialog"
        >
          <MicIcon className="w-24 h-24 text-white animate-pulse mb-6" />
          <p className="text-white text-2xl font-semibold mb-2">Listening...</p>
          <p className="text-gray-300 text-lg h-8 min-h-[2rem] px-4 text-center">{transcript ? `"${transcript}"` : 'Say a command...'}</p>
        </div>
      )}

      {/* Error Toast */}
      {visibleError && (
        <div 
          className="fixed bottom-24 right-6 z-30 max-w-sm bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-lg"
          role="alert"
        >
          <p className="font-bold">Voice Command Error</p>
          <p>{visibleError}</p>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={startListening}
        className="fixed bottom-6 right-6 z-30 w-16 h-16 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 active:bg-green-800 transition-all duration-300 flex items-center justify-center"
        aria-label="Activate voice commands"
        disabled={isListening}
      >
        <MicIcon className="w-8 h-8" />
      </button>
    </>
  );
};