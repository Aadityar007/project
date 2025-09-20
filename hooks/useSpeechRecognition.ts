import { useState, useEffect, useRef } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve "Cannot find name 'SpeechRecognition'".
// These interfaces define the shape of the API for TypeScript.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

// Polyfill for browsers that might have prefixed APIs
// FIX: Cast window to any to access prefixed APIs and rename variable to avoid shadowing the global SpeechRecognition type.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = (onTranscriptChange: (transcript: string) => void) => {  
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // FIX: This now correctly refers to the global SpeechRecognition type, as it's no longer shadowed.
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // FIX: Use renamed variable to check for browser support.
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }

    // FIX: Use renamed variable to create an instance.
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if(finalTranscript) {
        onTranscriptChange(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = `Speech recognition error: ${event.error}.`;
      if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access denied. Please enable it in your browser settings to use speech-to-text.'
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
          // If it stopped but we still want to be listening, restart it.
          // This handles cases where the mic times out.
          recognition.start();
      }
    };
    
    recognitionRef.current = recognition;
  }, [isListening, onTranscriptChange]);

  const startListening = (lang: string) => {
    if (!window.isSecureContext) {
        setError("Speech recognition requires a secure connection (HTTPS).");
        return;
    }
    if (recognitionRef.current && !isListening) {
      setError(null);
      recognitionRef.current.lang = lang;
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const toggleListening = (lang: string) => {
    if (isListening) {
      stopListening();
    } else {
      startListening(lang);
    }
  };
  
  return {
    isListening,
    error,
    startListening,
    stopListening,
    toggleListening,
    // FIX: Use renamed variable to indicate recognition support.
    hasRecognitionSupport: !!SpeechRecognitionAPI,
  };
};