import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2, Loader2 } from 'lucide-react';

interface InlineEditProps {
  value: string | number;
  onSave: (newValue: string | number) => Promise<void>;
  type?: 'text' | 'number' | 'currency' | 'select';
  options?: Array<{ value: string; label: string }>;
  format?: (value: any) => string;
  className?: string;
  placeholder?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  type = 'text',
  options,
  format,
  className = '',
  placeholder = 'Click to edit'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save:', err);
      setError(err instanceof Error ? err.message : 'Failed to save');
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'text') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = format ? format(value) : value;

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className={`group inline-flex items-center gap-2 hover:bg-neutral-50 px-2 py-1 rounded transition-colors ${className}`}
        type="button"
      >
        <span className={!value ? 'text-neutral-400' : ''}>
          {displayValue || placeholder}
        </span>
        <Edit2 className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="inline-flex items-center gap-2">
        {type === 'select' && options ? (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
            className="px-2 py-1 border border-mpondo-gold-300 rounded focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent disabled:opacity-50"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type === 'currency' ? 'number' : type}
            value={editValue}
            onChange={(e) => setEditValue(type === 'number' || type === 'currency' ? Number(e.target.value) : e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!isSaving) {
                setTimeout(() => handleSave(), 100);
              }
            }}
            disabled={isSaving}
            className="px-2 py-1 border border-mpondo-gold-300 rounded focus:ring-2 focus:ring-mpondo-gold-500 focus:border-transparent disabled:opacity-50"
            step={type === 'currency' ? '0.01' : undefined}
          />
        )}
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 text-status-success-600 hover:bg-status-success-50 rounded transition-colors disabled:opacity-50"
          type="button"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
        
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 text-status-error-600 hover:bg-status-error-50 rounded transition-colors disabled:opacity-50"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {error && (
        <span className="text-xs text-status-error-600">{error}</span>
      )}
    </div>
  );
};
