/**
 * VoiceInputButton Component
 * 
 * Reusable voice input button with visual feedback and accessibility features.
 * Integrates with the useVoiceInput hook for speech-to-text functionality.
 * 
 * Requirements: 11.6
 */
import React from 'react';
import { cn } from '../../lib/utils';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'floating';
  disabled?: boolean;
  language?: string;
  placeholder?: string;
}

/**
 * VoiceInputButton Component
 * 
 * Features:
 * - Visual feedback during recording
 * - Accessibility support with ARIA labels
 * - Error handling and user feedback
 * - Multiple sizes and variants
 * - Haptic feedback on supported devices
 * - Real-time recording indicator
 * 
 * @example
 * ```tsx
 * <VoiceInputButton
 *   onTranscript={(text) => setFieldValue(text)}
 *   onError={(error) => showToast(error)}
 *   size="md"
 *   variant="default"
 * />
 * ```
 */
export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  onError,
  className,
  size = 'md',
  variant = 'default',
  disabled = false,
  language = 'en-ZA',
  placeholder = 'Tap to speak...',
}) => {
  const {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    clearError,
  } = useVoiceInput({
    language,
    onResult: (text, confidence) => {
      // Only accept results with reasonable confidence
      if (confidence > 0.5 || confidence === 0) { // confidence 0 means not available
        onTranscript(text);
        
        // Haptic feedback on success
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 50]);
        }
      }
    },
    onError: (errorMessage) => {
      onError?.(errorMessage);
      
      // Haptic feedback on error
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 100, 100]);
      }
    },
    onStart: () => {
      clearError();
      
      // Haptic feedback on start
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    },
  });

  // Handle button click
  const handleClick = () => {
    if (!isSupported) {
      onError?.('Voice input is not supported in this browser');
      return;
    }

    if (disabled) return;

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2 w-8 h-8';
      case 'lg':
        return 'p-4 w-14 h-14';
      case 'md':
      default:
        return 'p-3 w-12 h-12';
    }
  };

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'floating':
        return cn(
          'fixed bottom-6 right-6 z-50 rounded-full shadow-lg',
          'bg-mpondo-gold-500 text-white',
          'hover:bg-mpondo-gold-600 active:bg-mpondo-gold-700',
          'dark:bg-mpondo-gold-400 dark:text-neutral-900',
          'dark:hover:bg-mpondo-gold-300'
        );
      case 'default':
      default:
        return cn(
          'rounded-lg',
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 active:bg-neutral-300 dark:bg-metallic-gray-700 dark:text-neutral-400 dark:hover:bg-metallic-gray-600'
        );
    }
  };

  // Get icon
  const getIcon = () => {
    if (isListening) {
      return <MicOff className={cn('w-5 h-5', size === 'sm' && 'w-4 h-4', size === 'lg' && 'w-6 h-6')} />;
    }
    
    return <Mic className={cn('w-5 h-5', size === 'sm' && 'w-4 h-4', size === 'lg' && 'w-6 h-6')} />;
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mpondo-gold-400 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'mobile-touch-target',
          getSizeClasses(),
          getVariantClasses(),
          // Pulse animation when listening
          isListening && 'animate-pulse',
          className
        )}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        aria-pressed={isListening}
        title={isListening ? 'Stop recording' : placeholder}
      >
        {getIcon()}
      </button>

      {/* Recording indicator */}
      {isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
        </div>
      )}

      {/* Transcript preview (for floating variant) */}
      {variant === 'floating' && transcript && (
        <div className="absolute bottom-full right-0 mb-2 max-w-xs">
          <div className="bg-black/80 text-white text-sm rounded-lg px-3 py-2 backdrop-blur-sm">
            <p className="truncate">{transcript}</p>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
          <div className="bg-red-500 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            Voice input error
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * VoiceInputField Component
 * 
 * Input field with integrated voice input button.
 */
interface VoiceInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onVoiceTranscript?: (text: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  language?: string;
}

export const VoiceInputField: React.FC<VoiceInputFieldProps> = ({
  value,
  onChange,
  onVoiceTranscript,
  placeholder = 'Type or speak...',
  className,
  disabled = false,
  multiline = false,
  rows = 3,
  language = 'en-ZA',
}) => {
  const handleVoiceTranscript = (transcript: string) => {
    // Append to existing value or replace if empty
    const newValue = value ? `${value} ${transcript}` : transcript;
    onChange(newValue);
    onVoiceTranscript?.(transcript);
  };

  const handleError = (error: string) => {
    // Could integrate with toast system here
    console.error('Voice input error:', error);
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      <InputComponent
        type={multiline ? undefined : 'text'}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
          onChange(e.target.value)
        }
        placeholder={placeholder}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        className={cn(
          "block w-full pr-14 px-4 py-4 text-base",
          "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
          "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
          "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "mobile-touch-target",
          multiline && "resize-none",
          className
        )}
      />
      
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <VoiceInputButton
          onTranscript={handleVoiceTranscript}
          onError={handleError}
          size="sm"
          disabled={disabled}
          language={language}
          placeholder="Tap to speak"
        />
      </div>
    </div>
  );
};