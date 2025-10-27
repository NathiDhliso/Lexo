/**
 * useVoiceInput Hook
 * 
 * Custom hook for handling voice input using the Web Speech API.
 * Provides speech-to-text functionality with error handling and status management.
 * 
 * Requirements: 11.6
 */
import { useState, useCallback, useRef, useEffect } from 'react';

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface VoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
}

/**
 * useVoiceInput Hook
 * 
 * Features:
 * - Web Speech API integration
 * - Real-time transcript updates
 * - Confidence scoring
 * - Error handling and recovery
 * - Support detection
 * - Customizable language and settings
 * 
 * @example
 * ```tsx
 * const {
 *   isListening,
 *   isSupported,
 *   transcript,
 *   startListening,
 *   stopListening,
 *   clearTranscript
 * } = useVoiceInput({
 *   language: 'en-ZA',
 *   onResult: (text) => setFieldValue(text),
 *   onError: (error) => showError(error)
 * });
 * ```
 */
export const useVoiceInput = (options: VoiceInputOptions = {}) => {
  const {
    language = 'en-ZA', // South African English
    continuous = false,
    interimResults = false,
    maxAlternatives = 1,
    onResult,
    onError,
    onStart,
    onEnd,
  } = options;

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0,
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configure recognition
      recognition.lang = language;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;

      // Event handlers
      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
        onStart?.();
      };

      recognition.onresult = (event) => {
        const results = event.results;
        const lastResult = results[results.length - 1];
        
        if (lastResult) {
          const transcript = lastResult[0].transcript;
          const confidence = lastResult[0].confidence;
          
          setState(prev => ({
            ...prev,
            transcript,
            confidence,
          }));

          // Call callback if final result
          if (lastResult.isFinal) {
            onResult?.(transcript, confidence);
          }
        }
      };

      recognition.onerror = (event) => {
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not available.';
            break;
          case 'bad-grammar':
            errorMessage = 'Speech recognition grammar error.';
            break;
          case 'language-not-supported':
            errorMessage = 'Language not supported.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        setState(prev => ({
          ...prev,
          isListening: false,
          error: errorMessage,
        }));

        onError?.(errorMessage);
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
        onEnd?.();
        
        // Clear timeout if it exists
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      setState(prev => ({ ...prev, isSupported: true }));
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false,
        error: 'Speech recognition not supported in this browser'
      }));
    }

    // Cleanup
    return () => {
      if (recognitionRef.current && state.isListening) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, continuous, interimResults, maxAlternatives]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !state.isSupported) {
      const error = 'Speech recognition not available';
      setState(prev => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    if (state.isListening) {
      return; // Already listening
    }

    try {
      // Clear previous transcript and error
      setState(prev => ({ 
        ...prev, 
        transcript: '', 
        confidence: 0, 
        error: null 
      }));

      recognitionRef.current.start();

      // Set timeout to automatically stop after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);

    } catch (error) {
      const errorMessage = 'Failed to start speech recognition';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [state.isSupported, state.isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [state.isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      transcript: '', 
      confidence: 0, 
      error: null 
    }));
  }, []);

  // Reset error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    isListening: state.isListening,
    isSupported: state.isSupported,
    transcript: state.transcript,
    confidence: state.confidence,
    error: state.error,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    clearError,
  };
};