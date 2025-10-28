/**
 * useVoiceRecording Hook
 * 
 * Enhanced voice recording hook for matter description capture
 * Extends useVoiceInput with recording state management and error handling
 */

import { useState, useCallback, useRef } from 'react';
import { useVoiceInput } from './useVoiceInput';
import { toast } from 'react-hot-toast';

export interface VoiceRecordingState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  duration: number; // in seconds
  error: string | null;
  isSupported: boolean;
}

export interface UseVoiceRecordingOptions {
  language?: string;
  maxDuration?: number; // in seconds
  onTranscriptComplete?: (transcript: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceRecording = (options: UseVoiceRecordingOptions = {}) => {
  const {
    language = 'en-ZA',
    maxDuration = 300, // 5 minutes default
    onTranscriptComplete,
    onError
  } = options;

  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isProcessing: false,
    transcript: '',
    duration: 0,
    error: null,
    isSupported: true
  });

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const voiceInputRef = useRef<any>(null);

  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const handleError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isRecording: false,
      isProcessing: false,
      error
    }));

    onError?.(error);
    
    // User-friendly error messages
    let userMessage = 'Recording error occurred';
    
    if (error.includes('not-allowed') || error.includes('permission')) {
      userMessage = 'Microphone permission denied. Please enable microphone access.';
    } else if (error.includes('no-speech')) {
      userMessage = 'No speech detected. Please try again.';
    } else if (error.includes('network')) {
      userMessage = 'Network error. Please check your connection.';
    } else if (error.includes('not-supported')) {
      userMessage = 'Voice recording is not supported in your browser.';
      setState(prev => ({ ...prev, isSupported: false }));
    }

    toast.error(userMessage);
  }, [onError]);

  const startDurationTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    
    durationTimerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        
        setState(prev => ({
          ...prev,
          duration: elapsed
        }));

        // Auto-stop if max duration reached
        if (elapsed >= maxDuration) {
          if (voiceInputRef.current?.isListening) {
            voiceInputRef.current.stopListening();
          }
          stopDurationTimer();
          toast('Maximum recording duration reached', { icon: '⏱️' });
        }
      }
    }, 1000);
  }, [maxDuration, stopDurationTimer]);

  // Voice input hook for speech recognition
  const voiceInput = useVoiceInput({
    language,
    continuous: true,
    interimResults: true,
    onResult: (transcript, confidence) => {
      setState(prev => ({
        ...prev,
        transcript,
        isProcessing: false
      }));

      // Call completion callback if provided
      if (confidence > 0.7) {
        onTranscriptComplete?.(transcript);
      }
    },
    onError: (error) => {
      handleError(error);
    },
    onStart: () => {
      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null
      }));
    },
    onEnd: () => {
      stopDurationTimer();
      setState(prev => ({
        ...prev,
        isRecording: false,
        isProcessing: prev.transcript.length > 0
      }));
    }
  });

  // Store voiceInput in ref for timer callback
  voiceInputRef.current = voiceInput;

  const startRecording = useCallback(() => {
    if (!voiceInput.isSupported) {
      handleError('not-supported');
      return;
    }

    // Reset state
    setState(prev => ({
      ...prev,
      transcript: '',
      duration: 0,
      error: null,
      isProcessing: false
    }));

    // Start recording
    startDurationTimer();
    voiceInput.startListening();
  }, [voiceInput, startDurationTimer, handleError]);

  const stopRecording = useCallback(() => {
    stopDurationTimer();
    voiceInput.stopListening();
    
    setState(prev => ({
      ...prev,
      isRecording: false,
      isProcessing: prev.transcript.length > 0
    }));
  }, [voiceInput, stopDurationTimer]);

  const clearTranscript = useCallback(() => {
    voiceInput.clearTranscript();
    setState(prev => ({
      ...prev,
      transcript: '',
      duration: 0,
      error: null,
      isProcessing: false
    }));
  }, [voiceInput]);

  const updateTranscript = useCallback((newTranscript: string) => {
    setState(prev => ({
      ...prev,
      transcript: newTranscript
    }));
  }, []);

  return {
    ...state,
    transcript: state.transcript || voiceInput.transcript,
    startRecording,
    stopRecording,
    clearTranscript,
    updateTranscript,
    toggleRecording: () => {
      if (state.isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };
};
