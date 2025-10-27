/**
 * MobileFormInputs Components
 * 
 * Collection of mobile-optimized form input components with proper input types,
 * masks, auto-complete, and accessibility features.
 * 
 * Requirements: 11.3
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff, Search, X } from 'lucide-react';

// Base mobile input props
interface BaseMobileInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helpText?: string;
}

/**
 * MobileTextInput Component
 * 
 * Basic text input optimized for mobile with proper touch targets.
 */
interface MobileTextInputProps extends BaseMobileInputProps {
  type?: 'text' | 'email' | 'tel' | 'url' | 'search';
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'numeric' | 'decimal';
}

export const MobileTextInput: React.FC<MobileTextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  disabled = false,
  required = false,
  className,
  helpText,
  type = 'text',
  autoComplete,
  maxLength,
  pattern,
  inputMode,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        pattern={pattern}
        inputMode={inputMode}
        className={cn(
          "block w-full px-4 py-4 text-base",
          "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
          "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
          "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "mobile-touch-target",
          error && "border-red-500 focus:ring-red-500",
          // Prevent zoom on iOS
          "text-base"
        )}
        style={{ fontSize: '16px' }} // Explicit font size to prevent iOS zoom
      />
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{helpText}</p>
      )}
    </div>
  );
};

/**
 * MobileCurrencyInput Component
 * 
 * Currency input with South African Rand formatting and input mask.
 */
interface MobileCurrencyInputProps extends Omit<BaseMobileInputProps, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const MobileCurrencyInput: React.FC<MobileCurrencyInputProps> = ({
  label,
  placeholder = "0.00",
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  disabled = false,
  required = false,
  className,
  helpText,
  min = 0,
  max,
  step = 0.01,
}) => {
  const [displayValue, setDisplayValue] = useState(value ? value.toString() : '');
  const [isFocused, setIsFocused] = useState(false);

  // Format display value when not focused
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value ? value.toString() : '');
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value ? value.toString() : '');
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    const numValue = parseFloat(displayValue) || 0;
    onChange(numValue);
    onBlur?.();
  };

  const handleChange = (inputValue: string) => {
    // Allow only numbers and decimal point
    const cleanValue = inputValue.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    const formattedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : cleanValue;
    
    setDisplayValue(formattedValue);
    
    // Update parent with numeric value
    const numValue = parseFloat(formattedValue) || 0;
    onChange(numValue);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-neutral-400 font-medium">R</span>
        </div>
        
        <input
          type="number"
          inputMode="decimal"
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          className={cn(
            "block w-full pl-12 pr-4 py-4 text-lg font-semibold",
            "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
            "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
            "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "mobile-touch-target",
            error && "border-red-500 focus:ring-red-500"
          )}
          style={{ fontSize: '16px' }}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{helpText}</p>
      )}
    </div>
  );
};

/**
 * MobilePhoneInput Component
 * 
 * Phone number input with South African formatting.
 */
interface MobilePhoneInputProps extends BaseMobileInputProps {
  countryCode?: string;
}

export const MobilePhoneInput: React.FC<MobilePhoneInputProps> = ({
  label,
  placeholder = "082 123 4567",
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  disabled = false,
  required = false,
  className,
  helpText,
  countryCode = "+27",
}) => {
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format as South African mobile number
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const handleChange = (inputValue: string) => {
    const formatted = formatPhoneNumber(inputValue);
    onChange(formatted);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-neutral-600 dark:text-neutral-400">{countryCode}</span>
        </div>
        
        <input
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="tel"
          className={cn(
            "block w-full pl-16 pr-4 py-4 text-base",
            "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
            "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
            "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "mobile-touch-target",
            error && "border-red-500 focus:ring-red-500"
          )}
          style={{ fontSize: '16px' }}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{helpText}</p>
      )}
    </div>
  );
};

/**
 * MobilePasswordInput Component
 * 
 * Password input with show/hide toggle.
 */
interface MobilePasswordInputProps extends BaseMobileInputProps {
  autoComplete?: 'current-password' | 'new-password';
  minLength?: number;
  showStrengthIndicator?: boolean;
}

export const MobilePasswordInput: React.FC<MobilePasswordInputProps> = ({
  label,
  placeholder = "Enter password",
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  disabled = false,
  required = false,
  className,
  helpText,
  autoComplete = 'current-password',
  minLength,
  showStrengthIndicator = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = showStrengthIndicator ? getPasswordStrength(value) : 0;
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          className={cn(
            "block w-full px-4 pr-12 py-4 text-base",
            "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
            "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
            "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "mobile-touch-target",
            error && "border-red-500 focus:ring-red-500"
          )}
          style={{ fontSize: '16px' }}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      
      {showStrengthIndicator && value && (
        <div className="space-y-1">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded',
                  i < strength ? strengthColors[strength - 1] : 'bg-neutral-200 dark:bg-metallic-gray-700'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Password strength: {strengthLabels[strength - 1] || 'Very Weak'}
          </p>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{helpText}</p>
      )}
    </div>
  );
};

/**
 * MobileSearchInput Component
 * 
 * Search input with clear button and suggestions.
 */
interface MobileSearchInputProps extends BaseMobileInputProps {
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

export const MobileSearchInput: React.FC<MobileSearchInputProps> = ({
  label,
  placeholder = "Search...",
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  disabled = false,
  required = false,
  className,
  helpText,
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = true,
  maxSuggestions = 5,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(value.toLowerCase()) && 
      suggestion.toLowerCase() !== value.toLowerCase()
    )
    .slice(0, maxSuggestions);

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestionsList(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Delay to allow suggestion click
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestionsList(false);
      onBlur?.();
    }, 150);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestionsList(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('space-y-2 relative', className)}>
      {label && (
        <label className="block text-base font-medium text-neutral-700 dark:text-neutral-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-neutral-400" />
        </div>
        
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={cn(
            "block w-full pl-12 pr-12 py-4 text-base",
            "border border-neutral-300 dark:border-metallic-gray-600 rounded-xl",
            "focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent",
            "bg-white dark:bg-metallic-gray-800 text-neutral-900 dark:text-neutral-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "mobile-touch-target",
            error && "border-red-500 focus:ring-red-500"
          )}
          style={{ fontSize: '16px' }}
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Suggestions */}
      {showSuggestions && showSuggestionsList && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-metallic-gray-800 border border-neutral-200 dark:border-metallic-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-base hover:bg-neutral-50 dark:hover:bg-metallic-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{helpText}</p>
      )}
    </div>
  );
};