import React, { useState, useEffect, useRef } from 'react';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  Lock,
  Scale,
  ShieldCheck
} from 'lucide-react';
import lexoLogo from '../Public/Assets/lexo-logo.png';
import { toast } from 'react-hot-toast';
import LexoHubBGhd from '../Public/Assets/LexoHubBGhd.jpg';

// ===========================================
// AUTH UTILITIES - Token cleanup & validation
// ===========================================
const clearAuthStorage = async (supabase: any) => {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    await supabase.auth.signOut();
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Auth storage cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('Error clearing auth storage:', error);
    return { success: false, error };
  }
};

// ===========================================
// VALIDATION UTILITIES
// ===========================================
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, message: 'Email is required' };
  if (!emailRegex.test(email)) return { isValid: false, message: 'Invalid email format' };
  return { isValid: true };
};

const validatePassword = (password: string) => {
  if (!password) return { isValid: false, message: 'Password is required', strength: 0 };
  
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (password.length < 6) return { isValid: false, message: 'Password must be at least 6 characters', strength };
  if (password.length < 8) return { isValid: true, warning: 'Consider using 8+ characters for better security', strength };
  
  return { isValid: true, strength };
};

const validateName = (name: string) => {
  if (!name) return { isValid: false, message: 'Full name is required' };
  if (name.trim().length < 2) return { isValid: false, message: 'Name must be at least 2 characters' };
  if (!/^[a-zA-Z\s]+$/.test(name)) return { isValid: false, message: 'Name should only contain letters' };
  return { isValid: true };
};

// ===========================================
// AUTH HOOK
// ===========================================
const useAuth = (supabase: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          await clearAuthStorage(supabase);
          setUser(null);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        await clearAuthStorage(supabase);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('Auth event:', event);
        
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.error('Token refresh failed, clearing session');
          await clearAuthStorage(supabase);
          setUser(null);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      await clearAuthStorage(supabase);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      await clearAuthStorage(supabase);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            user_type: metadata.user_type,
            full_name: metadata.full_name,
          },
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Magic link error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      setUser(null);
      return { error };
    }
  };

  return { user, loading, signIn, signUp, signInWithMagicLink, signOut };
};



// ===========================================
// GLOBAL STYLES
// ===========================================
const GlobalStyles = () => (
  <style>{`
    .safe-area-inset {
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
    }
    .pb-safe {
      padding-bottom: max(1rem, env(safe-area-inset-bottom));
    }
    @supports (height: 100dvh) {
      .min-h-screen {
        min-height: 100dvh;
      }
    }
    @keyframes headerFadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes floatSubtle {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-5px);
      }
    }
    .header-entrance {
      animation: headerFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .float-animation {
      animation: floatSubtle 3s ease-in-out infinite;
    }
    input, select, textarea {
      font-size: 16px !important;
    }
    input::placeholder, textarea::placeholder {
      color: rgba(201, 169, 97, 0.5) !important;
    }
    button, a, input[type="checkbox"] {
      min-height: 44px;
      min-width: 44px;
    }
    @media (prefers-reduced-motion: reduce) {
      .header-entrance,
      .float-animation,
      .transition-all {
        animation-duration: 1ms !important;
        transition-duration: 1ms !important;
      }
    }
  `}</style>
);

// ===========================================
// UTILITY FUNCTION
// ===========================================
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===========================================
// LOADING SPINNER
// ===========================================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses: Record<string, string> = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-16 w-16' };
  return (
    <div className={cn(sizeClasses[size], 'animate-spin rounded-full border-b-2 border-t-2 border-white', className)} />
  );
};

// ===========================================
// SKELETON LOADING PAGE
// ===========================================
const SkeletonAuthPage = () => (
  <div className="min-h-[100svh] w-screen overflow-hidden flex flex-col bg-slate-900 font-sans">
    <div className="absolute inset-0 bg-black/70"></div>
    <div className="relative z-10 w-full h-full flex flex-col p-4">
      <header className="text-center mb-6 flex-shrink-0">
        <div className="h-9 w-40 bg-slate-700/50 rounded-md mx-auto mb-3 animate-pulse"></div>
        <div className="h-5 w-80 bg-slate-700/50 rounded-md mx-auto animate-pulse"></div>
      </header>
      <main className="bg-black/40 rounded-xl border border-white/30 flex-1 flex items-center justify-center overflow-hidden w-full max-w-md mx-auto">
        <div className="w-full p-8 animate-pulse">
          <div className="h-9 w-3/4 bg-slate-700/50 rounded-md mb-4 mx-auto"></div>
          <div className="h-12 w-full bg-slate-700/50 rounded-md mb-3"></div>
          <div className="h-12 w-full bg-slate-700/50 rounded-md mb-3"></div>
          <div className="h-12 w-full bg-slate-700/50 rounded-md"></div>
        </div>
      </main>
    </div>
  </div>
);

// ===========================================
// AUTH TOGGLE COMPONENT
// ===========================================
type AuthMode = 'signin' | 'signup';

interface AuthToggleProps {
  activeMode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

const AuthToggle: React.FC<AuthToggleProps> = ({ activeMode, onModeChange }) => (
  <div className="w-full max-w-md mx-auto mb-4 sm:mb-6 md:mb-8 px-4">
    <div 
      className="backdrop-blur-sm rounded-2xl p-1.5 flex gap-2"
      style={{
        background: 'linear-gradient(145deg, rgba(30, 58, 95, 0.4), rgba(44, 62, 80, 0.4))',
        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 -2px 4px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(201, 169, 97, 0.2)'
      }}
    >
      <button
        type="button"
        onClick={() => onModeChange('signin')}
        className={cn(
          "flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300",
          activeMode === 'signin'
            ? "text-white"
            : "text-white/60 hover:text-white/90"
        )}
        style={activeMode === 'signin' ? {
          background: 'linear-gradient(145deg, #1e3a5f, #2c3e50)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(201, 169, 97, 0.3)'
        } : {}}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onModeChange('signup')}
        className={cn(
          "flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300",
          activeMode === 'signup'
            ? "text-white"
            : "text-white/60 hover:text-white/90"
        )}
        style={activeMode === 'signup' ? {
          background: 'linear-gradient(145deg, #1e3a5f, #2c3e50)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -1px 2px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(201, 169, 97, 0.3)'
        } : {}}
      >
        Sign Up
      </button>
    </div>
  </div>
);

// ===========================================
// MAIN LOGIN PAGE
// ===========================================
interface LoginPageProps {
  supabase: any;
}

const LoginPage: React.FC<LoginPageProps> = ({ supabase }) => {
  const { signIn, signUp, signInWithMagicLink, loading } = useAuth(supabase);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    confirmPassword: '', 
    rememberMe: true, 
    termsAccepted: false 
  });

  const formRef = useRef<HTMLFormElement>(null);

  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePassword(formData.password);
  const nameValidation = validateName(formData.fullName);

  const isFormValid = emailValidation.isValid && passwordValidation.isValid && (authMode === 'signin' || (nameValidation.isValid && formData.termsAccepted));

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);

    const isConfirmed = urlParams.get('confirmed') === 'true' || hashParams.get('confirmed') === 'true';

    if (isConfirmed) {
      setAuthMode('signin');
      const successMsg = '✅ Email confirmed successfully! You can now sign in with your credentials.';
      setSuccess(successMsg);
      toast.success('Email confirmed! Please sign in to continue.', {
        duration: 6000,
        icon: '✅'
      });

      const cleanUrl = window.location.pathname + window.location.hash.split('?')[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setFormData(prev => ({ ...prev, email: '', password: '', fullName: '', confirmPassword: '', termsAccepted: false }));
    setTouchedFields(new Set());
    setShowPassword(false);
  }, [authMode]);

  const handleInputChange = (field: string, value: string | boolean) => {
    let finalValue = value;
    if (field === 'fullName' && typeof value === 'string') {
      finalValue = value.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
    }
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    if (value && !touchedFields.has(field)) {
      setTouchedFields(prev => new Set(prev).add(field));
    }
  };

  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTouchedFields(new Set(['email', 'password', 'fullName']));

    if (!isFormValid) {
      const message = 'Please fix the errors above before submitting.';
      setError(message);
      toast.error(message);
      setTimeout(() => { (formRef.current?.querySelector('[aria-invalid="true"]') as HTMLInputElement)?.focus(); }, 100);
      return;
    }

    setIsSubmitting(true);

    try {
      if (authMode === 'signin') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          const message = error.message || 'Failed to sign in. Please check your credentials.';
          setError(message);
          toast.error(message, { duration: 5000 });
        } else {
          const successMsg = 'Signed in successfully';
          setSuccess(successMsg);
          toast.success('Welcome back!', { duration: 3000 });
          setRedirecting(true);
          setTimeout(() => { window.location.href = '/'; }, 300);
        }
      } else {
        const metadata = { user_type: 'junior' as 'junior' | 'senior', full_name: formData.fullName };
        const { error } = await signUp(formData.email, formData.password, metadata);
        if (error) {
          const message = error.message || 'Failed to create account. Please try again.';
          setError(message);
          toast.error(message, { duration: 5000 });
        } else {
          const successMsg = 'Account created successfully! Please check your email to confirm your address.';
          setSuccess(successMsg);
          toast.success('Account created! Check your email to confirm.', { duration: 6000 });
        }
      }
    } catch (err) {
      const message = 'An unexpected error occurred. Please try again.';
      setError(message);
      toast.error(message, { duration: 5000 });
      console.error('Authentication error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMagicLink = async () => {
    setError(null);
    setSuccess(null);

    if (!emailValidation.isValid) {
      const msg = emailValidation.message || 'Please enter a valid email address.';
      setError(msg);
      toast.error(msg, { duration: 4000 });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await signInWithMagicLink(formData.email);
      if (error) {
        const message = error.message || 'Failed to send magic link. Please try again.';
        setError(message);
        toast.error(message, { duration: 5000 });
      } else {
        const successMsg = 'Magic link sent successfully! Check your email to sign in.';
        setSuccess(successMsg);
        toast.success('Magic link sent! Check your email.', { duration: 6000 });
      }
    } catch (err) {
      const message = 'Failed to send magic link. Please try again.';
      setError(message);
      toast.error(message, { duration: 5000 });
      console.error('Magic link error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <SkeletonAuthPage />;

  const SignupBgImage = LexoHubBGhd;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        fontFamily: "Inter, sans-serif",
        backgroundImage: `url(${SignupBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <GlobalStyles />

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 safe-area-inset">
        <header className="text-center mb-6 sm:mb-8 md:mb-12 header-entrance w-full max-w-md px-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 group">
            <img
              src={lexoLogo}
              alt="LexoHub Logo"
              className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-contain transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-2xl float-animation"
              style={{ background: 'transparent' }}
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider drop-shadow-2xl transition-all duration-300 group-hover:text-blue-100">
              lexo
            </h1>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-slate-100 leading-tight font-medium drop-shadow-lg px-4">
            Where Strategy Meets Practice.
          </p>
        </header>

        <AuthToggle activeMode={authMode} onModeChange={setAuthMode} />

        <div className="w-full max-w-md mx-auto px-4 mb-8">
              {authMode === 'signin' ? (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5 relative z-10">
                  {error && (
                    <div className="bg-red-500/30 border border-red-500/50 rounded-lg p-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-300" />
                      <p className="text-xs text-red-200">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-500/30 border border-green-500/50 rounded-lg p-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <p className="text-xs text-green-200">{success}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-semibold pl-1" style={{ color: '#c9a961', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>Email</label>
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-base rounded-lg outline-none transition-all duration-300"
                      style={{
                        background: 'linear-gradient(145deg, rgba(20, 30, 48, 0.8), rgba(30, 40, 60, 0.8))',
                        color: '#ffffff',
                        fontSize: '16px',
                        minHeight: '44px',
                        boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.6), inset 0 -1px 3px rgba(255, 255, 255, 0.05), inset 2px 0 4px rgba(0, 0, 0, 0.4), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(201, 169, 97, 0.2)',
                        borderTop: '2px solid rgba(0, 0, 0, 0.4)',
                        borderLeft: '2px solid rgba(0, 0, 0, 0.3)'
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-semibold pl-1" style={{ color: '#c9a961', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={e => handleInputChange('password', e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 sm:py-3.5 pr-12 text-base rounded-lg outline-none transition-all duration-300"
                        style={{
                          background: 'linear-gradient(145deg, rgba(20, 30, 48, 0.8), rgba(30, 40, 60, 0.8))',
                          color: '#ffffff',
                          fontSize: '16px',
                          minHeight: '44px',
                          boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.6), inset 0 -1px 3px rgba(255, 255, 255, 0.05), inset 2px 0 4px rgba(0, 0, 0, 0.4), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(201, 169, 97, 0.2)',
                          borderTop: '2px solid rgba(0, 0, 0, 0.4)',
                          borderLeft: '2px solid rgba(0, 0, 0, 0.3)'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1"
                        style={{ minWidth: '44px', minHeight: '44px', color: '#c9a961' }}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={handleSendMagicLink}
                      className="font-medium underline underline-offset-2 transition-colors"
                      style={{ color: '#c9a961' }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-3.5 md:py-4 text-base sm:text-lg rounded-lg font-bold mt-2 sm:mt-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, #1e3a5f, #2c3e50)',
                      color: '#c9a961',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(201, 169, 97, 0.3)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.15), inset 0 -2px 4px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    <span className="relative z-10">{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                  </button>
                </form>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 md:space-y-4 relative z-10">
                  {error && (
                    <div className="bg-red-500/30 border border-red-500/50 rounded-lg p-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-300" />
                      <p className="text-xs text-red-200">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-500/30 border border-green-500/50 rounded-lg p-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-300" />
                      <p className="text-xs text-green-200">{success}</p>
                    </div>
                  )}

                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base rounded-lg outline-none transition-all duration-300"
                    style={{
                      background: 'linear-gradient(145deg, rgba(20, 30, 48, 0.8), rgba(30, 40, 60, 0.8))',
                      color: '#ffffff',
                      fontSize: '16px',
                      minHeight: '44px',
                      boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.6), inset 0 -1px 3px rgba(255, 255, 255, 0.05), inset 2px 0 4px rgba(0, 0, 0, 0.4), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(201, 169, 97, 0.2)',
                      borderTop: '2px solid rgba(0, 0, 0, 0.4)',
                      borderLeft: '2px solid rgba(0, 0, 0, 0.3)'
                    }}
                    required
                  />

                  <input
                    id="email-signup"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base rounded-lg outline-none transition-all duration-300"
                    style={{
                      background: 'linear-gradient(145deg, rgba(20, 30, 48, 0.8), rgba(30, 40, 60, 0.8))',
                      color: '#ffffff',
                      fontSize: '16px',
                      minHeight: '44px',
                      boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.6), inset 0 -1px 3px rgba(255, 255, 255, 0.05), inset 2px 0 4px rgba(0, 0, 0, 0.4), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(201, 169, 97, 0.2)',
                      borderTop: '2px solid rgba(0, 0, 0, 0.4)',
                      borderLeft: '2px solid rgba(0, 0, 0, 0.3)'
                    }}
                    required
                  />

                  <div className="relative">
                    <input
                      id="password-signup"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="New Password"
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 text-base rounded-lg outline-none transition-all duration-300"
                      style={{
                        background: 'linear-gradient(145deg, rgba(20, 30, 48, 0.8), rgba(30, 40, 60, 0.8))',
                        color: '#ffffff',
                        fontSize: '16px',
                        minHeight: '44px',
                        boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.6), inset 0 -1px 3px rgba(255, 255, 255, 0.05), inset 2px 0 4px rgba(0, 0, 0, 0.4), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(201, 169, 97, 0.2)',
                        borderTop: '2px solid rgba(0, 0, 0, 0.4)',
                        borderLeft: '2px solid rgba(0, 0, 0, 0.3)'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1"
                      style={{ minWidth: '44px', minHeight: '44px', color: '#c9a961' }}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base rounded-lg outline-none transition-all duration-300"
                    style={{
                      background: 'linear-gradient(145deg, rgba(20, 30, 48, 0.8), rgba(30, 40, 60, 0.8))',
                      color: '#ffffff',
                      fontSize: '16px',
                      minHeight: '44px',
                      boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.6), inset 0 -1px 3px rgba(255, 255, 255, 0.05), inset 2px 0 4px rgba(0, 0, 0, 0.4), inset -2px 0 4px rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(201, 169, 97, 0.2)',
                      borderTop: '2px solid rgba(0, 0, 0, 0.4)',
                      borderLeft: '2px solid rgba(0, 0, 0, 0.3)'
                    }}
                    required
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className="rounded border-2 focus:ring-2"
                      style={{
                        accentColor: '#c9a961',
                        borderColor: '#c9a961'
                      }}
                    />
                    <label htmlFor="terms" className="text-xs font-medium" style={{ color: '#c9a961', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>
                      I agree to Terms & Conditions
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.termsAccepted}
                    className="w-full py-3 sm:py-3.5 md:py-4 text-base sm:text-lg rounded-lg font-bold mt-2 sm:mt-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, #1e3a5f, #2c3e50)',
                      color: '#c9a961',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(201, 169, 97, 0.3)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && formData.termsAccepted) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.15), inset 0 -2px 4px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    <span className="relative z-10">{isSubmitting ? 'Creating Account...' : 'Register'}</span>
                  </button>
                </form>
              )}
            </div>

        <footer className="text-center mt-4 sm:mt-6 md:mt-8 space-y-3 sm:space-y-4 px-4 header-entrance pb-safe">
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 flex-wrap">
            <div 
              className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 58, 95, 0.3), rgba(44, 62, 80, 0.3))',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(201, 169, 97, 0.2)'
              }}
            >
              <Lock size={12} className="sm:w-3.5 sm:h-3.5" style={{ color: '#c9a961' }} />
              <span className="text-[10px] sm:text-xs font-medium" style={{ color: '#c9a961' }}>256-bit SSL</span>
            </div>
            <div 
              className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 58, 95, 0.3), rgba(44, 62, 80, 0.3))',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(201, 169, 97, 0.2)'
              }}
            >
              <ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5" style={{ color: '#c9a961' }} />
              <span className="text-[10px] sm:text-xs font-medium" style={{ color: '#c9a961' }}>POPIA Compliant</span>
            </div>
            <div 
              className="flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 58, 95, 0.3), rgba(44, 62, 80, 0.3))',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(201, 169, 97, 0.2)'
              }}
            >
              <Scale size={12} className="sm:w-3.5 sm:h-3.5" style={{ color: '#c9a961' }} />
              <span className="text-[10px] sm:text-xs font-medium" style={{ color: '#c9a961' }}>Legal Grade Security</span>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs font-medium" style={{ color: '#c9a961', textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>&copy; {new Date().getFullYear()} lexo. All rights reserved. Data stored in South Africa.</p>
        </footer>

        {redirecting && (
          <>
            <div role="alert" aria-live="polite" className="sr-only">Redirecting...</div>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-black/50 border border-white/30 rounded-lg px-4 py-3 text-white flex items-center gap-3 shadow-xl">
                <LoadingSpinner size="md" />
                <span className="text-sm">Redirecting…</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;