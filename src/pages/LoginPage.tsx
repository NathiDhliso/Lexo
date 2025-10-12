import React, { useState, useEffect, useRef } from 'react';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import gsap from 'gsap';
import {
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  Scale,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import lexoLogo from '../Public/Assets/lexo-logo.png';
import { toast } from 'react-hot-toast';
import LexoHubBGhd from '../Public/Assets/LexoHubBGhd.jpg';

// ===========================================
// AUTH UTILITIES - Token cleanup & validation
// ===========================================
const clearAuthStorage = async (supabase: any) => {
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
// AUTH HOOK - Fixed with token error handling
// ===========================================
const useAuth = (supabase: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
// DEVICE TYPE HOOK
// ===========================================
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState({
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceType({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
};

// ===========================================
// GLOBAL STYLES
// ===========================================
const GlobalStyles = () => (
  <style>{`
    .glass-auth {
      will-change: transform, opacity, filter;
      transform-style: preserve-3d;
      backface-visibility: visible;
    }
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
    .input-focus-glow:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2);
    }
    @media (max-width: 767px) {
      .glass-auth {
        transform: none !important;
        perspective: none !important;
        filter: none !important;
      }
      input, select, textarea {
        font-size: 16px !important;
      }
      button, a, input[type="checkbox"] {
        min-height: 44px;
        min-width: 44px;
      }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .glass-auth {
        perspective: 1800px !important;
      }
    }
    @media (min-width: 1024px) {
      .glass-auth {
        perspective: 2500px !important;
      }
      .glass-auth input,
      .glass-auth label {
        font-size: 0.9rem !important;
      }
      .glass-auth h2 {
        font-size: 1.75rem !important;
        margin-bottom: 1rem !important;
      }
      .glass-auth button[type="submit"] {
        font-size: 0.95rem !important;
        padding: 0.75rem 1rem !important;
      }
      .glass-auth form {
        gap: 0.75rem !important;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .glass-auth,
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
    <div className="bg-white dark:bg-metallic-gray-800/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-1.5 flex gap-2 theme-shadow-lg">
      <button
        type="button"
        onClick={() => onModeChange('signin')}
        className={cn(
          "flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300",
          activeMode === 'signin'
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105"
            : "text-white/70 hover:text-white hover:bg-white/5"
        )}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onModeChange('signup')}
        className={cn(
          "flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300",
          activeMode === 'signup'
            ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105"
            : "text-white/70 hover:text-white hover:bg-white/5"
        )}
      >
        Sign Up
      </button>
    </div>
  </div>
);

// ===========================================
// MAIN LOGIN PAGE - REQUIRES supabase prop
// ===========================================
interface LoginPageProps {
  supabase: any;
}

const LoginPage: React.FC<LoginPageProps> = ({ supabase }) => {
  const { signIn, signUp, signInWithMagicLink, loading } = useAuth(supabase);
  const { isMobile, isTablet, isDesktop } = useDeviceType();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
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
  const loginPanelRef = useRef<HTMLDivElement>(null);
  const signupPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setMousePosition({ x, y });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

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
    setShowValidation(false);
    setTouchedFields(new Set());
    setShowPassword(false);
  }, [authMode]);

  useEffect(() => {
    if (!isMobile && loginPanelRef.current && signupPanelRef.current) {
      const timeline = gsap.timeline();

      if (authMode === 'signin') {
        timeline
          .to(loginPanelRef.current, {
            x: 0,
            y: 0,
            scale: 1.0,
            rotationY: 0,
            opacity: 1,
            filter: 'blur(0px) brightness(1)',
            zIndex: 10,
            pointerEvents: 'auto',
            visibility: 'visible',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 15px 40px rgba(0,0,0,0.6), 0 5px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)',
            duration: 0.8,
            ease: 'power4.out'
          }, 0)
          .to(signupPanelRef.current, {
            x: 220,
            y: 0,
            scale: 0.55,
            rotationY: 45,
            opacity: 0.6,
            filter: 'blur(1.5px) brightness(0.75)',
            zIndex: 1,
            pointerEvents: 'auto',
            visibility: 'visible',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.4)',
            duration: 0.8,
            ease: 'power4.out'
          }, 0);
      } else {
        timeline
          .to(signupPanelRef.current, {
            x: 0,
            y: 0,
            scale: 1.0,
            rotationY: 0,
            opacity: 1,
            filter: 'blur(0px) brightness(1)',
            zIndex: 10,
            pointerEvents: 'auto',
            visibility: 'visible',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 15px 40px rgba(0,0,0,0.6), 0 5px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)',
            duration: 0.8,
            ease: 'power4.out'
          }, 0)
          .to(loginPanelRef.current, {
            x: -220,
            y: 0,
            scale: 0.55,
            rotationY: -45,
            opacity: 0.6,
            filter: 'blur(1.5px) brightness(0.75)',
            zIndex: 1,
            pointerEvents: 'auto',
            visibility: 'visible',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.4)',
            duration: 0.8,
            ease: 'power4.out'
          }, 0);
      }
    }
  }, [authMode, isMobile]);

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
    setShowValidation(true);
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
    setShowValidation(true);
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
          <p className="text-sm sm:text-base md:text-lg text-slate-100 leading-tight font-medium drop-theme-shadow-lg px-4">
            Where Strategy Meets Practice.
          </p>
        </header>

        {isMobile || isTablet ? (
          <>
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
                    <label htmlFor="email" className="block text-sm font-medium text-white/90 pl-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 text-base rounded-xl sm:rounded-2xl bg-white/95 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800 theme-shadow-lg"
                      style={{
                        boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(255,255,255,0.2)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                        borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                        fontSize: '16px',
                        minHeight: '44px'
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-white/90 pl-1">Password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={e => handleInputChange('password', e.target.value)}
                        className="w-full px-3 sm:px-4 py-3 sm:py-3.5 pr-12 text-base rounded-xl sm:rounded-2xl bg-white/95 border-2 border-white/90 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800 theme-shadow-lg"
                        style={{
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)',
                          fontSize: '16px',
                          minHeight: '44px'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900 transition-colors p-1"
                        style={{ minWidth: '44px', minHeight: '44px' }}
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
                      className="text-sky-200 hover:text-sky-100 font-medium underline underline-offset-2 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-3.5 md:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white font-bold mt-2 sm:mt-3 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_6px_20px_rgba(59,130,246,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden border border-blue-400/30"
                  >
                    <span className="relative z-10 drop-theme-shadow-lg">{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
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
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base rounded-xl sm:rounded-2xl bg-white/40 border-2 border-white/70 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-400/70 focus:border-green-400/60 focus:bg-white/50 outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800/45"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)',
                      fontSize: '16px',
                      minHeight: '44px'
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
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base rounded-xl sm:rounded-2xl bg-white/40 border-2 border-white/70 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-400/70 focus:border-green-400/60 focus:bg-white/50 outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800/45"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)',
                      fontSize: '16px',
                      minHeight: '44px'
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
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-12 text-base rounded-xl sm:rounded-2xl bg-white/40 border-2 border-white/70 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-400/70 focus:border-green-400/60 focus:bg-white/50 outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800/45"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)',
                        fontSize: '16px',
                        minHeight: '44px'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
                      style={{ minWidth: '44px', minHeight: '44px' }}
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
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-base rounded-xl sm:rounded-2xl bg-white/40 border-2 border-white/70 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-400/70 focus:border-green-400/60 focus:bg-white/50 outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800/45"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)',
                      fontSize: '16px',
                      minHeight: '44px'
                    }}
                    required
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className="rounded bg-white dark:bg-metallic-gray-800 border-2 border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="terms" className="text-xs text-white font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                      I agree to Terms & Conditions
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.termsAccepted}
                    className="w-full py-3 sm:py-3.5 md:py-4 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white font-bold mt-2 sm:mt-3 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_6px_20px_rgba(34,197,94,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden border border-green-400/30"
                  >
                    <span className="relative z-10 drop-theme-shadow-lg">{isSubmitting ? 'Creating Account...' : 'Register'}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div
            ref={containerRef}
            className="relative flex items-center justify-center mb-6 sm:mb-8 md:mb-12 w-full"
            style={{
              width: "100%",
              maxWidth: "min(95vw, 500px)",
              height: "auto",
              minHeight: "350px",
              perspective: "2500px",
              perspectiveOrigin: "center center",
            }}
          >
            <div
              ref={loginPanelRef}
              className="absolute w-full max-w-[90vw] sm:max-w-[320px] h-auto min-h-[400px] sm:h-[450px] cursor-pointer glass-auth"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: authMode === 'signin' ? 'auto' : 'auto',
                visibility: 'visible'
              }}
              onClick={() => setAuthMode('signin')}
            >
              <div className="border-[3px] sm:border-[3px] border-white/90 shadow-2xl rounded-[18px] sm:rounded-[20px] h-full w-full flex flex-col justify-center p-4 sm:p-6 md:p-7 relative" style={{
                backgroundImage: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
                boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 20px 50px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.2), inset 2px 0 4px rgba(255,255,255,0.6), inset -2px 0 4px rgba(0,0,0,0.15)',
                borderTop: '2px solid rgba(255, 255, 255, 0.6)',
                borderLeft: '2px solid rgba(255, 255, 255, 0.5)',
                borderBottom: '2px solid rgba(0, 0, 0, 0.2)',
                borderRight: '2px solid rgba(0, 0, 0, 0.15)',
                transform: `translateZ(0px) rotateX(${mousePosition.y * 3}deg) rotateY(${mousePosition.x * 3}deg)`,
                transition: 'transform 0.3s ease-out',
                overflow: 'visible'
              }}>
                <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-bold mb-3 sm:mb-4 md:mb-5 text-center relative z-10" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.5), 0 -1px 1px rgba(255,255,255,0.2)' }}>LOGIN</h2>
                {authMode === 'signin' && (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3 md:space-y-3.5 relative z-10">
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
                      <label htmlFor="desktop-email" className="block text-sm font-medium text-white/90 pl-1">Email</label>
                      <input
                        id="desktop-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm rounded-xl sm:rounded-xl bg-white/95 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800 theme-shadow-lg"
                        style={{
                          boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(255,255,255,0.2)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                          borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="desktop-password" className="block text-sm font-medium text-white/90 pl-1">Password</label>
                      <div className="relative">
                        <input
                          id="desktop-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={e => handleInputChange('password', e.target.value)}
                          className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 pr-10 text-sm rounded-xl sm:rounded-xl bg-white/95 border-2 border-white/90 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800 theme-shadow-lg"
                          style={{
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900 transition-colors p-1"
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
                        className="text-sky-200 hover:text-sky-100 font-medium underline underline-offset-2 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 sm:py-3 md:py-3 text-sm sm:text-base rounded-xl sm:rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white font-bold mt-2 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_6px_20px_rgba(59,130,246,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden border border-blue-400/30"
                    >
                      <span className="relative z-10 drop-theme-shadow-lg">{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div
              ref={signupPanelRef}
              className="absolute w-full max-w-[90vw] sm:max-w-[320px] h-auto min-h-[400px] sm:h-[450px] cursor-pointer glass-auth"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: authMode === 'signup' ? 'auto' : 'auto',
                visibility: 'visible'
              }}
              onClick={() => setAuthMode('signup')}
            >
              <div className="border-[3px] sm:border-[3px] border-white/90 shadow-2xl rounded-[18px] sm:rounded-[20px] h-full w-full flex flex-col justify-center p-4 sm:p-6 md:p-7 relative" style={{
                backgroundImage: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
                boxShadow: '0 40px 100px rgba(0,0,0,0.25), 0 20px 50px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.2), inset 2px 0 4px rgba(255,255,255,0.6), inset -2px 0 4px rgba(0,0,0,0.15)',
                borderTop: '2px solid rgba(255, 255, 255, 0.6)',
                borderLeft: '2px solid rgba(255, 255, 255, 0.5)',
                borderBottom: '2px solid rgba(0, 0, 0, 0.2)',
                borderRight: '2px solid rgba(0, 0, 0, 0.15)',
                transform: `translateZ(0px) rotateX(${mousePosition.y * 3}deg) rotateY(${mousePosition.x * 3}deg)`,
                transition: 'transform 0.3s ease-out',
                overflow: 'visible'
              }}>
                <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-bold mb-3 sm:mb-4 md:mb-5 text-center relative z-10" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.5), 0 -1px 1px rgba(255,255,255,0.2)' }}>SIGN UP</h2>
                {authMode === 'signup' && (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-2 sm:space-y-2.5 md:space-y-3 relative z-10">
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
                      <label htmlFor="desktop-fullName" className="block text-xs font-medium text-white/90 pl-1">Full Name</label>
                      <input
                        id="desktop-fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={e => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm rounded-xl sm:rounded-xl bg-white/95 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800 theme-shadow-lg"
                        style={{
                          boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(255,255,255,0.2)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                          borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="desktop-email-signup" className="block text-xs font-medium text-white/90 pl-1">Email</label>
                      <input
                        id="desktop-email-signup"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm rounded-xl sm:rounded-xl bg-white/95 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800 theme-shadow-lg"
                        style={{
                          boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(255,255,255,0.2)',
                          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                          borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                          borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="desktop-password-signup" className="block text-xs font-medium text-white/90 pl-1">Password</label>
                      <div className="relative">
                        <input
                          id="desktop-password-signup"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={e => handleInputChange('password', e.target.value)}
                          className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 pr-10 text-sm rounded-xl sm:rounded-xl bg-white/95 border-2 border-white/90 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800 theme-shadow-lg"
                          style={{
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900 transition-colors p-1"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="desktop-confirmPassword" className="block text-xs font-medium text-white/90 pl-1">Confirm Password</label>
                      <input
                        id="desktop-confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={e => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-sm rounded-xl sm:rounded-xl bg-white/95 border-2 border-white/90 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white dark:bg-metallic-gray-800 theme-shadow-lg"
                        style={{
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)'
                        }}
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="desktop-terms"
                        checked={formData.termsAccepted}
                        onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                        className="rounded bg-white dark:bg-metallic-gray-800 border-2 border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <label htmlFor="desktop-terms" className="text-xs text-white font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        I agree to Terms & Conditions
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.termsAccepted}
                      className="w-full py-2.5 sm:py-3 md:py-3 text-sm sm:text-base rounded-xl sm:rounded-xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white font-bold mt-2 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_6px_20px_rgba(34,197,94,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden border border-green-400/30"
                    >
                      <span className="relative z-10 drop-theme-shadow-lg">{isSubmitting ? 'Creating Account...' : 'Register'}</span>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        <footer className="text-center mt-4 sm:mt-6 md:mt-8 space-y-3 sm:space-y-4 px-4 header-entrance pb-safe">
          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 text-slate-200/90 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 hover:bg-white dark:bg-metallic-gray-800/10 transition-all">
              <Lock size={12} className="sm:w-3.5 sm:h-3.5 text-blue-300" />
              <span className="text-[10px] sm:text-xs font-medium">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 hover:bg-white dark:bg-metallic-gray-800/10 transition-all">
              <ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5 text-green-300" />
              <span className="text-[10px] sm:text-xs font-medium">POPIA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 hover:bg-white dark:bg-metallic-gray-800/10 transition-all">
              <Scale size={12} className="sm:w-3.5 sm:h-3.5 text-yellow-300" />
              <span className="text-[10px] sm:text-xs font-medium">Legal Grade Security</span>
            </div>
          </div>
          <p className="text-slate-300/80 text-[10px] sm:text-xs font-medium">&copy; {new Date().getFullYear()} lexo. All rights reserved. Data stored in South Africa.</p>
        </footer>

        {redirecting && (
          <>
            <div role="alert" aria-live="polite" className="sr-only">Redirecting...</div>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-black/50 border border-white/30 rounded-lg px-4 py-3 text-white flex items-center gap-3 theme-shadow-xl">
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