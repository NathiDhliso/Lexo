/**
 * Validation Utilities
 * 
 * Comprehensive validation functions and patterns for forms and data validation.
 * Eliminates repetitive validation logic across components.
 */

export type ValidationRule<T = any> = (value: T, data?: any, field?: string) => string | null;

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

export interface Validator<T> {
  validate: (data: T) => ValidationResult;
  validateField: (field: keyof T, value: T[keyof T], data?: T) => string | null;
  isValid: (data: T) => boolean;
  getErrors: (data: T) => Record<string, string>;
}

/**
 * Create a validator from a schema
 */
export function createValidator<T extends Record<string, any>>(
  schema: ValidationSchema<T>
): Validator<T> {
  const validate = (data: T): ValidationResult => {
    const errors: Record<string, string> = {};
    
    Object.entries(schema).forEach(([field, rules]) => {
      const fieldRules = rules as ValidationRule<any>[];
      const value = data[field as keyof T];
      
      for (const rule of fieldRules) {
        const error = rule(value, data, field);
        if (error) {
          errors[field] = error;
          break; // Stop at first error for this field
        }
      }
    });
    
    const isValid = Object.keys(errors).length === 0;
    const firstError = Object.values(errors)[0];
    
    return { isValid, errors, firstError };
  };

  const validateField = (field: keyof T, value: T[keyof T], data?: T): string | null => {
    const rules = schema[field];
    if (!rules) return null;
    
    for (const rule of rules) {
      const error = rule(value, data || {} as T, String(field));
      if (error) return error;
    }
    
    return null;
  };

  const isValid = (data: T): boolean => {
    return validate(data).isValid;
  };

  const getErrors = (data: T): Record<string, string> => {
    return validate(data).errors;
  };

  return { validate, validateField, isValid, getErrors };
}

// ============================================================================
// BASIC VALIDATION RULES
// ============================================================================

/**
 * Required field validation
 */
export function required(message = 'This field is required'): ValidationRule {
  return (value: any) => {
    if (value === null || value === undefined) return message;
    if (typeof value === 'string' && value.trim() === '') return message;
    if (Array.isArray(value) && value.length === 0) return message;
    return null;
  };
}

/**
 * Minimum length validation
 */
export function minLength(min: number, message?: string): ValidationRule<string> {
  return (value: string) => {
    if (!value) return null; // Let required() handle empty values
    if (value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  };
}

/**
 * Maximum length validation
 */
export function maxLength(max: number, message?: string): ValidationRule<string> {
  return (value: string) => {
    if (!value) return null;
    if (value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return null;
  };
}

/**
 * Pattern matching validation
 */
export function pattern(regex: RegExp, message = 'Invalid format'): ValidationRule<string> {
  return (value: string) => {
    if (!value) return null;
    if (!regex.test(value)) return message;
    return null;
  };
}

/**
 * Field matching validation (e.g., confirm password)
 */
export function matches(otherField: string, message?: string): ValidationRule {
  return (value: any, data: any) => {
    if (!data || value !== data[otherField]) {
      return message || `Must match ${otherField}`;
    }
    return null;
  };
}

// ============================================================================
// SPECIALIZED VALIDATION RULES
// ============================================================================

/**
 * Email validation
 */
export function email(message = 'Invalid email address'): ValidationRule<string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern(emailRegex, message);
}

/**
 * Phone number validation (basic)
 */
export function phone(message = 'Invalid phone number'): ValidationRule<string> {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return pattern(phoneRegex, message);
}

/**
 * URL validation
 */
export function url(message = 'Invalid URL'): ValidationRule<string> {
  return (value: string) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  };
}

/**
 * Password strength validation
 */
export function strongPassword(message = 'Password must contain uppercase, lowercase, number, and special character'): ValidationRule<string> {
  return (value: string) => {
    if (!value) return null;
    
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
      return message;
    }
    
    return null;
  };
}

/**
 * Numeric validation
 */
export function numeric(message = 'Must be a number'): ValidationRule<string | number> {
  return (value: string | number) => {
    if (value === null || value === undefined || value === '') return null;
    
    const num = Number(value);
    if (isNaN(num)) return message;
    
    return null;
  };
}

/**
 * Positive number validation
 */
export function positive(message = 'Must be a positive number'): ValidationRule<number> {
  return (value: number) => {
    if (value === null || value === undefined) return null;
    if (value <= 0) return message;
    return null;
  };
}

/**
 * Date validation
 */
export function validDate(message = 'Invalid date'): ValidationRule<string | Date> {
  return (value: string | Date) => {
    if (!value) return null;
    
    const date = new Date(value);
    if (isNaN(date.getTime())) return message;
    
    return null;
  };
}

/**
 * Future date validation
 */
export function futureDate(message = 'Date must be in the future'): ValidationRule<string | Date> {
  return (value: string | Date) => {
    if (!value) return null;
    
    const date = new Date(value);
    const now = new Date();
    
    if (date <= now) return message;
    
    return null;
  };
}

/**
 * One of validation (enum-like)
 */
export function oneOf<T>(options: T[], message?: string): ValidationRule<T> {
  return (value: T) => {
    if (value === null || value === undefined) return null;
    if (!options.includes(value)) {
      return message || `Must be one of: ${options.join(', ')}`;
    }
    return null;
  };
}

/**
 * Custom validation rule
 */
export function custom<T>(
  validator: (value: T, data?: any, field?: string) => boolean,
  message: string
): ValidationRule<T> {
  return (value: T, data?: any, field?: string) => {
    if (!validator(value, data, field)) return message;
    return null;
  };
}

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * User profile validation schema
 */
export const userProfileSchema = {
  email: [required(), email()],
  full_name: [required(), minLength(2), maxLength(100)],
  phone: [phone()],
  firm_name: [maxLength(200)],
  bar_number: [maxLength(50)],
  practice_area: [maxLength(100)],
};

/**
 * Matter validation schema
 */
export const matterSchema = {
  title: [required(), minLength(3), maxLength(200)],
  client_name: [required(), minLength(2), maxLength(100)],
  estimated_fee: [required(), numeric(), positive()],
  description: [maxLength(1000)],
  matter_type: [required()],
  urgency: [oneOf(['low', 'medium', 'high', 'urgent'])],
};

/**
 * Quick validation helpers
 */
export const validate = {
  /**
   * Quick email validation
   */
  email: (value: string): boolean => {
    return email()(value) === null;
  },

  /**
   * Quick required validation
   */
  required: (value: any): boolean => {
    return required()(value) === null;
  },

  /**
   * Quick numeric validation
   */
  numeric: (value: any): boolean => {
    return numeric()(value) === null;
  },

  /**
   * Quick positive number validation
   */
  positive: (value: number): boolean => {
    return positive()(value) === null;
  },

  /**
   * Quick URL validation
   */
  url: (value: string): boolean => {
    return url()(value) === null;
  },
};