import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
 
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import { Eye, EyeOff, BrainCircuit, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const isDark = document.documentElement.classList.contains('dark');
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isMagicLink, setIsMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const navigate = useNavigate();
  const { login, signInWithMagicLink, user, profile } = useAuthStore();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      if (profile.status === "active") {
        if (profile.role === "master_admin") navigate("/master-admin/dashboard");
        else if (profile.role === "admin") navigate("/admin/dashboard");
        else if (profile.role === "user") navigate("/dashboard");
      } else if (profile.status === "pending_approval") {
        if (profile.role === "admin") navigate("/admin-lobby");
        else if (profile.role === "user") navigate("/user-lobby");
      } else if (profile.status === "rejected") {
        navigate("/not-approved");
      }
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const { profile } = await login(email, password);

      if (!profile) {
        throw new Error("User profile not found. Please contact support.");
      }

      if (profile.status === "pending_email_verification") {
        throw new Error("Please verify your email first.");
      }

      if (profile.status === "rejected") {
        navigate("/not-approved");
        return;
      }

      if (profile.role === "master_admin" && profile.status === "active") {
        navigate("/master-admin/dashboard");
      } else if (profile.role === "admin") {
        if (profile.status === "active") navigate("/admin/dashboard");
        else if (profile.status === "pending_approval") navigate("/admin-lobby");
      } else if (profile.role === "user") {
        if (profile.status === "active") navigate("/dashboard");
        else if (profile.status === "pending_approval") navigate("/user-lobby");
      }
    } catch (err) {
      console.error("Login component error:", err);
      let errMsg = err.message || "Invalid credentials. Please try again.";
      if (errMsg.toLowerCase().includes("failed to fetch")) {
        errMsg = "Network Error: Failed to fetch. This usually happens if your browser's ad-blocker (like Brave Shields, uBlock Origin, etc.) is blocking Supabase requests. Please try disabling your ad-blocker for this site and refresh!";
      }
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      console.error("Magic link error:", err);
      let errMsg = err.message || "Failed to send magic link. Please check your email.";
      if (errMsg.toLowerCase().includes("failed to fetch")) {
        errMsg = "Network Error: Failed to fetch. This usually happens if your browser's ad-blocker (like Brave Shields, uBlock Origin, etc.) is blocking Supabase requests. Please try disabling your ad-blocker for this site and refresh!";
      }
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google login failed", err.message);
    }
  };

  const currentSubmitHandler = isMagicLink ? handleMagicLink : handleLogin;

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{
          background: document.documentElement.classList.contains('dark') 
            ? 'linear-gradient(160deg, #0f2a1a 0%, #1a3a25 60%, #0d2b1a 100%)'
            : 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)',
        }}
      >
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 max-w-lg">
          <div
            className="p-3 rounded-2xl w-fit mb-8"
            style={{ background: 'rgba(34,160,69,0.08)', border: '1px solid #d1fae5' }}
          >
            <BrainCircuit className="w-10 h-10" style={{ color: '#16a34a' }} />
          </div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '48px',
              fontWeight: 800,
              color: isDark ? '#ffffff' : '#0f1f12',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '24px',
            }}
          >
            Automate your{' '}
            <span style={{ color: '#16a34a' }}>IT Support</span>
          </h1>

          <p style={{ color: isDark ? '#d1fae5' : '#374151', fontSize: '16px', lineHeight: 1.7, marginBottom: '32px' }}>
            Join thousands of IT teams using HelpDesk.ai to categorize, route, and resolve tickets instantly.
          </p>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #d1fae5',
              borderRadius: '14px',
              padding: '14px 18px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#f0fdf4' }}>
                <div style={{ color: '#0f1f12', fontWeight: 800, fontSize: '14px' }}>AI</div>
              </div>
              <div>
                <p className="flex items-center gap-2" style={{ fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  <span
                    className="inline-block w-2 h-2 rounded-full animate-pulse"
                    style={{ background: '#22c55e' }}
                  />
                  System Status
                </p>
                <p style={{ color: '#111827', fontWeight: 500, fontSize: '14px' }}>All systems operational. 99.9% uptime this month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div
        className="flex w-full lg:w-1/2 items-center justify-center p-6 relative"
        style={{ background: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff', borderLeft: '1px solid #f0fdf4' }}
      >
        <Link
          to="/"
          className="absolute top-8 left-8 flex items-center gap-2 transition-all group"
          style={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
        >
          <div className="p-2 rounded-full transition-all" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Home</span>
        </Link>

        <div className="w-full max-w-md mt-8 lg:mt-0" style={{ padding: '32px' }}>
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '28px',
                fontWeight: 800,
                color: isDark ? '#ffffff' : '#0f1f12',
                letterSpacing: '-0.02em',
                marginBottom: '8px',
              }}
            >
              Welcome Back
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Please sign in to continue</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '14px 16px' }}>
              <div className="rounded-full p-1 mt-0.5" style={{ background: '#fee2e2' }}>
                <ArrowRight className="w-3 h-3 text-red-600 rotate-45" />
              </div>
              <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>{error}</p>
            </div>
          )}

          {magicLinkSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}>
                <BrainCircuit className="w-8 h-8" style={{ color: '#16a34a' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f1f12', marginBottom: '8px' }}>Check your email</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>We've sent a magic link to <span style={{ fontWeight: 600, color: '#111827' }}>{email}</span></p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className="hover:underline transition-all"
                style={{ color: '#16a34a', fontWeight: 700, fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={currentSubmitHandler} className="space-y-5">
              <div>
                <label
                  className="block mb-2"
                  style={{ fontSize: '12px', fontWeight: 600, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your system email"
                  style={{
                    width: '100%',
                    background: '#f9fafb',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '13px 16px',
                    fontSize: '15px',
                    color: '#111827',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,160,69,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {!isMagicLink && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="flex justify-between items-center mb-2">
                    <label
                      className="block"
                      style={{ fontSize: '12px', fontWeight: 600, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      title="Reset your password"
                      className="transition-all"
                      style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      style={{
                        width: '100%',
                        background: '#f9fafb',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '13px 16px',
                        paddingRight: '44px',
                        fontSize: '15px',
                        color: '#111827',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,160,69,0.1)'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(34,160,69,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,160,69,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,160,69,0.3)'; }}
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {!isSubmitting && (isMagicLink ? "Send Magic Link" : "Sign In")}
              </button>

              {/* Google Button */}
              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: isDark ? '#1f2937' : '#ffffff',
                  border: isDark ? '1.5px solid #374151' : '1.5px solid #e5e7eb',
                  color: isDark ? '#f9fafb' : '#374151',
                  borderRadius: '12px',
                  padding: '13px',
                  fontWeight: 500,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = isDark ? '#374151' : '#f9fafb';
                    e.currentTarget.style.borderColor = isDark ? '#4b5563' : '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = isDark ? '#1f2937' : '#ffffff';
                    e.currentTarget.style.borderColor = isDark ? '#374151' : '#e5e7eb';
                  }
                }}
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow" style={{ borderTop: '1px solid #e5e7eb' }}></div>
                <span className="flex-shrink-0 mx-4" style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 500 }}>Or</span>
                <div className="flex-grow" style={{ borderTop: '1px solid #e5e7eb' }}></div>
              </div>

              <button
                type="button"
                onClick={() => { setIsMagicLink(!isMagicLink); setError(""); }}
                className="w-full flex items-center justify-center gap-2 transition-all"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #d1fae5',
                  color: '#15803d',
                  borderRadius: '12px',
                  padding: '13px',
                  fontWeight: 500,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
              >
                {isMagicLink ? "Sign in with Password" : "Sign in with Magic Link"}
              </button>

              <p className="text-center" style={{ fontSize: '14px', color: '#6b7280', marginTop: '32px' }}>
                Don't have an account?{" "}
                <Link to="/signup" className="hover:underline transition-all" style={{ color: '#16a34a', fontWeight: 600 }}>
                  Create Account
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;