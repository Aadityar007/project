import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for the Web Speech API
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
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export interface Command {
  phrases: string[];
  callback: () => void;
}

export const useVoiceCommands = (commands: Command[]) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Memoize commands to prevent re-renders
  const memoizedCommands = useRef(commands);
  useEffect(() => {
    memoizedCommands.current = commands;
  }, [commands]);

  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false; // Stop after first utterance
    recognition.interimResults = true; // Show interim results for feedback

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript.trim().toLowerCase();
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(interim || final); // Update transcript for UI feedback

      if (final) {
        // Check for command match
        for (const command of memoizedCommands.current) {
          for (const phrase of command.phrases) {
            if (final.includes(phrase.toLowerCase())) {
              command.callback();
              // No need to stop manually, continuous is false
              return; // Exit after first match
            }
          }
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please enable it in your browser settings to use voice commands.');
      } else {
        setError(`Voice command error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript(''); // Clear transcript when done
    };

    recognitionRef.current = recognition;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Run only once

  const startListening = useCallback((lang: string) => {
    if (!window.isSecureContext) {
        setError("Voice commands require a secure connection (HTTPS).");
        return;
    }
    if (recognitionRef.current && !isListening) {
      setError(null);
      recognitionRef.current.lang = lang;
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      // onend will set isListening to false
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    hasRecognitionSupport: !!SpeechRecognitionAPI,
  };
};