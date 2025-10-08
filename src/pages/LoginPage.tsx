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
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';
import LexoHubBGhd from '../Public/Assets/LexoHubBGhd.jpg';
import { validateEmail, validatePassword, validateName } from '../utils/validation';

const GlobalStyles = () => (
  <style>{`
    .glass-auth {
      will-change: transform, opacity, filter;
      transform-style: preserve-3d;
      backface-visibility: visible;
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
    .btn-ripple {
      position: relative;
      overflow: hidden;
    }
    .btn-ripple::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    .btn-ripple:active::after {
      width: 300px;
      height: 300px;
      opacity: 0;
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


// --- Utility Function (previously in ./utils) ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}




// --- Placeholder Components (previously in separate files) ---

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-[0.98]",
        "px-4 py-2",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

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


const SignupBgImage = LexoHubBGhd;

type AuthMode = 'signin' | 'signup';


// Form Input Component
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; className?: string; required?: boolean; children?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  validation?: { isValid: boolean; message?: string; strength?: number; warning?: string };
  showValidation?: boolean; id: string; autoComplete?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  type = 'text', placeholder, value, onChange, className, required = false, children, icon: Icon, validation, showValidation = false, id, autoComplete, ...props 
}) => {
  const hasError = showValidation && validation && !validation.isValid;
  const hasSuccess = showValidation && validation && validation.isValid && value && !validation.warning;
  const hasWarning = showValidation && validation && validation.isValid && validation.warning;
  
  return (
    <div className="relative space-y-2">
      <div className="relative">
        {Icon && <Icon className="absolute left-1.5 sm:left-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-white/50 z-10" />}
        <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} autoComplete={autoComplete}
          className={cn(
            "w-full py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-opacity-75 focus:bg-white/15 hover:bg-white/12 text-sm font-medium input-focus-glow",
            "shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]",
            Icon ? "pl-8 sm:pl-10 pr-10" : "px-3 sm:px-4 pr-10",
            hasError && "border-red-400/50 focus:ring-red-400",
            hasSuccess && "border-green-400/50 focus:ring-green-400",
            hasWarning && "border-yellow-400/50 focus:ring-yellow-400",
            className
          )}
          required={required} aria-invalid={hasError} aria-describedby={hasError ? `${id}-error` : (hasWarning ? `${id}-warning` : undefined)}
          {...props}
        />
        {children}
        {showValidation && (
          <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2">
            {hasError && <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />}
            {hasSuccess && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />}
            {hasWarning && <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />}
          </div>
        )}
        {!showValidation && children && (
          <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2">
            {children}
          </div>
        )}
      </div>
      
      {showValidation && validation && !validation.isValid && validation.message && (
        <p id={`${id}-error`} className="text-sm text-red-300 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-4 h-4" /> {validation.message}
        </p>
      )}
       {showValidation && validation && validation.isValid && validation.warning && (
        <p id={`${id}-warning`} className="text-sm text-yellow-300 flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <AlertCircle className="w-4 h-4" /> {validation.warning}
        </p>
      )}
      
      {type === 'password' && showValidation && validation && value && (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div key={level} className={cn( "h-1.5 flex-1 rounded-full transition-all duration-300",
                  (validation.strength ?? 0) >= level ? ((validation.strength ?? 0) <= 2 ? "bg-red-400" : (validation.strength ?? 0) <= 3 ? "bg-yellow-400" : "bg-green-400") : "bg-white/20"
              )}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


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


const LoginPage = () => {
  const { signIn, signUp, signInWithMagicLink, loading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', confirmPassword: '', rememberMe: true, termsAccepted: false });
  
  const formRef = useRef<HTMLFormElement>(null);
  const loginPanelRef = useRef<HTMLDivElement>(null);
  const signupPanelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const emailValidation = validateEmail(formData.email);
  const passwordValidation = validatePassword(formData.password);
  const nameValidation = validateName(formData.fullName);

  const isFormValid = emailValidation.isValid && passwordValidation.isValid && (authMode === 'signin' || (nameValidation.isValid && formData.termsAccepted));

  useEffect(() => {
    setError(null); 
    setSuccess(null);
    setFormData(prev => ({ ...prev, email: '', password: '', fullName: '', confirmPassword: '', termsAccepted: false }));
    setShowValidation(false); 
    setTouchedFields(new Set()); 
    setShowPassword(false);
  }, [authMode]);

  useEffect(() => {
    if (!loginPanelRef.current || !signupPanelRef.current) return;

    const timeline = gsap.timeline();

    if (authMode === 'signin') {
      timeline
        .to(loginPanelRef.current, {
          x: 0,
          y: 0,
          scale: 1.2,
          rotationY: 0,
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          zIndex: 10,
          boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 15px 40px rgba(0,0,0,0.6), 0 5px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)',
          duration: 1,
          ease: 'power4.out'
        }, 0)
        .to(signupPanelRef.current, {
          x: 280,
          y: 0,
          scale: 0.65,
          rotationY: 50,
          opacity: 0.7,
          filter: 'blur(1.5px) brightness(0.75)',
          zIndex: 1,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.4)',
          duration: 1,
          ease: 'power4.out'
        }, 0);
    } else {
      timeline
        .to(signupPanelRef.current, {
          x: 0,
          y: 0,
          scale: 1.2,
          rotationY: 0,
          opacity: 1,
          filter: 'blur(0px) brightness(1)',
          zIndex: 10,
          boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 15px 40px rgba(0,0,0,0.6), 0 5px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.15)',
          duration: 1,
          ease: 'power4.out'
        }, 0)
        .to(loginPanelRef.current, {
          x: -280,
          y: 0,
          scale: 0.65,
          rotationY: -50,
          opacity: 0.7,
          filter: 'blur(1.5px) brightness(0.75)',
          zIndex: 1,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.4)',
          duration: 1,
          ease: 'power4.out'
        }, 0);
    }
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

  const handleInputBlur = (field: string) => { setTouchedFields(prev => new Set(prev).add(field)); setShowValidation(true); };

  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setShowValidation(true); setTouchedFields(new Set(['email', 'password', 'fullName']));
    if (!isFormValid) {
      setError('Please fix the errors above before submitting.');
      toast.error('Please fix the errors above before submitting.');
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
          toast.error(message);
        } else {
          setSuccess('Signed in successfully');
          toast.success('Welcome back');
          setRedirecting(true);
          setTimeout(() => { window.location.href = '/'; }, 300);
        }
      } else {
        const metadata = { user_type: 'junior' as 'junior' | 'senior', full_name: formData.fullName };
        const { error } = await signUp(formData.email, formData.password, metadata);
        if (error) {
          const message = error.message || 'Failed to create account. Please try again.';
          setError(message);
          toast.error(message);
        } else {
          // Show confirmation when signup succeeds (email verification flow)
          setSuccess('Account created. Please check your email to confirm your address.');
          toast.success('Account created. Check your email to confirm.');
        }
      }
    } catch {
      const message = 'An unexpected error occurred. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMagicLink = async () => {
    setShowValidation(true);
    if (!emailValidation.isValid) {
      const msg = emailValidation.message || 'Please enter a valid email.';
      setError(msg);
      toast.error(msg);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await signInWithMagicLink(formData.email);
      if (error) {
        const message = error.message || 'Failed to send magic link. Please try again.';
        setError(message);
        toast.error(message);
      } else {
        setSuccess('Magic link sent. Check your email to sign in.');
        toast.success('Magic link sent. Check your email.');
      }
    } catch (e) {
      const message = 'Failed to send magic link. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <SkeletonAuthPage />;

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
      
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <header className="text-center mb-12 header-entrance">
          <div className="flex items-center justify-center gap-3 mb-4 group">
            <img 
              src={lexoLogo} 
              alt="LexoHub Logo" 
              className="w-14 h-14 md:w-20 md:h-20 object-contain transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-2xl float-animation" 
              style={{ background: 'transparent' }} 
            />
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wider drop-shadow-2xl transition-all duration-300 group-hover:text-blue-100">
              lexo
            </h1>
          </div>
          <p className="text-base md:text-lg text-slate-100 leading-tight font-medium drop-shadow-lg">
            Where Strategy Meets Practice.
          </p>
        </header>

        <div
          ref={containerRef}
          className="relative flex items-center justify-center mb-12"
          style={{
            width: "1000px",
            maxWidth: "95vw",
            height: "600px",
            perspective: "2500px",
            perspectiveOrigin: "center center",
          }}
        >
          <div
            ref={loginPanelRef}
            className="absolute w-[440px] h-[600px] cursor-pointer glass-auth"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setAuthMode('signin')}
          >
            <div className="border-[4px] border-white/90 shadow-2xl rounded-[36px] h-full w-full flex flex-col justify-center p-10 relative" style={{
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
              <h2 className="text-4xl text-white font-bold mb-8 text-center relative z-10" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.5), 0 -1px 1px rgba(255,255,255,0.2)' }}>LOGIN</h2>
              {authMode === 'signin' && (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 relative z-10">
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
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white/95 text-slate-900 placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white shadow-lg"
                    style={{
                      boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.2), inset 0 -1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(255,255,255,0.2)',
                      borderTop: '1px solid rgba(255, 255, 255, 0.5)',
                      borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                    required
                  />
                  
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white/95 border-2 border-white/90 text-slate-900 placeholder-slate-600 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:bg-white outline-none transition-all duration-300 hover:bg-white shadow-lg"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 hover:text-slate-900 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white font-bold text-lg mt-4 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_6px_20px_rgba(59,130,246,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden border border-blue-400/30"
                  >
                    <span className="relative z-10 drop-shadow-lg">{isSubmitting ? 'Signing In...' : 'Submit'}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div
            ref={signupPanelRef}
            className="absolute w-[440px] h-[600px] cursor-pointer glass-auth"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setAuthMode('signup')}
          >
            <div className="border-[4px] border-white/90 shadow-2xl rounded-[36px] h-full w-full flex flex-col justify-center p-10 relative" style={{
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
              <h2 className="text-4xl text-white font-bold mb-8 text-center relative z-10" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.5), 0 -1px 1px rgba(255,255,255,0.2)' }}>SIGN UP</h2>
              {authMode === 'signup' && (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 relative z-10">
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
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-white/40 border-2 border-white/70 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-400/70 focus:border-green-400/60 focus:bg-white/50 outline-none transition-all duration-300 hover:bg-white/45"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)'
                    }}
                    required
                  />
                  
                  <input
                    id="email-signup"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-white/40 border-2 border-white/70 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-400/70 focus:border-green-400/60 focus:bg-white/50 outline-none transition-all duration-300 hover:bg-white/45"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)'
                    }}
                    required
                  />
                  
                  <div className="relative">
                    <input
                      id="password-signup"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="New Password"
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      className="w-full p-3.5 rounded-2xl bg-white/40 border-2 border-white/70 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-400/70 focus:border-green-400/60 focus:bg-white/50 outline-none transition-all duration-300 hover:bg-white/45"
                      style={{
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-white/40 border-2 border-white/70 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-400/70 focus:border-green-400/60 focus:bg-white/50 outline-none transition-all duration-300 hover:bg-white/45"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(255,255,255,0.1), 0 1px 2px rgba(255,255,255,0.2)'
                    }}
                    required
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.termsAccepted}
                      onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                      className="rounded bg-white border-2 border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="terms" className="text-xs text-white font-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                      I agree to Terms & Conditions
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.termsAccepted}
                    className="w-full py-4 rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 text-white font-bold text-lg mt-4 hover:scale-[1.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.6),0_6px_20px_rgba(34,197,94,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_4px_16px_rgba(0,0,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden border border-green-400/30"
                  >
                    <span className="relative z-10 drop-shadow-lg">{isSubmitting ? 'Creating Account...' : 'Register'}</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 space-y-4 px-4 header-entrance">
          <div className="flex items-center justify-center gap-4 sm:gap-6 text-slate-200/90 flex-wrap">
             <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
               <Lock size={14} className="text-blue-300" />
               <span className="text-xs font-medium">256-bit SSL</span>
             </div>
             <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
               <ShieldCheck size={14} className="text-green-300" />
               <span className="text-xs font-medium">POPIA Compliant</span>
             </div>
             <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
               <Scale size={14} className="text-yellow-300" />
               <span className="text-xs font-medium">Legal Grade Security</span>
             </div>
          </div>
            <p className="text-slate-300/80 text-xs font-medium">&copy; {new Date().getFullYear()} lexo. All rights reserved. Data stored in South Africa.</p>
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

