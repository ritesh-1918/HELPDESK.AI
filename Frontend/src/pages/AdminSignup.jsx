import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye, EyeOff, BrainCircuit, ArrowRight,
    Loader2, CheckCircle2, ChevronRight,
    ChevronLeft, ShieldCheck, Mail,
    Building2, User, Lock, Phone,
    Briefcase, Globe, Info
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { Select } from "../components/ui/select";
import { getPasswordValidation, getPasswordValidationMessage } from "../utils/passwordValidation";

/**
 * AdminSignup — Premium Multi-step Company Registration
 * Path: /admin-signup
 */
function AdminSignup() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Info
        fullName: "",
        email: "",
        phone: "",
        jobTitle: "",
        password: "",
        confirmPassword: "",
        // Company Details
        companyName: "",
        companySize: "",
        industry: "",
        website: "",
        country: "",
        // Agreements
        agreedToTerms: false,
        isAuthorized: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const navigate = useNavigate();
    const { signup, loading, user, profile } = useAuthStore();
    const passwordRules = {
        minLength: 8,
        requireUppercase: true,
        requireNumber: true,
        requireSpecial: true,
    };
    const passwordChecks = getPasswordValidation(formData.password, passwordRules);
    const passwordWarning = getPasswordValidationMessage(passwordChecks, passwordRules);

    // Redirect if already logged in and verified
    useEffect(() => {
        if (user && profile && profile.status === 'active') {
            navigate(profile.role === 'admin' ? "/admin/dashboard" : "/dashboard");
        }
    }, [user, profile, navigate]);

    // Password complexity validator — mirrors Supabase's policy
    const validatePassword = (pw) => {
        if (pw.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter (a-z).';
        if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter (A-Z).';
        if (!/[0-9]/.test(pw)) return 'Password must contain at least one number (0-9).';
        if (!/[^A-Za-z0-9]/.test(pw)) return 'Password must contain at least one special character.';
        return null; // valid
    };

    // Password strength calculation
    useEffect(() => {
        const pw = formData.password;
        let strength = 0;
        if (pw.length >= 8) strength += 25;
        if (/[A-Z]/.test(pw)) strength += 25;
        if (/[0-9]/.test(pw)) strength += 25;
        if (/[^A-Za-z0-9]/.test(pw)) strength += 25;
        setPasswordStrength(strength);
    }, [formData.password]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        setError("");
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
                setError("Please fill in all required personal information.");
                return;
            }
            if (passwordWarning) {
                setError(passwordWarning);
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
        } else if (step === 2) {
            if (!formData.companyName || !formData.companySize || !formData.industry || !formData.country) {
                setError("Please fill in all required company details.");
                return;
            }
        }
        setStep(prev => prev + 1);
        setError("");
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(prev => prev - 1);
        setError("");
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.agreedToTerms || !formData.isAuthorized) {
            setError("You must agree to the terms and authorize company registration.");
            return;
        }

        const pwError = validatePassword(formData.password);
        if (pwError) {
            setError(pwError);
            setStep(1);
            return;
        }

        try {
            await signup(
                formData.email,
                formData.password,
                formData.fullName,
                'admin',
                formData.companyName,
                {
                    phone: formData.phone,
                    job_title: formData.jobTitle,
                    company_size: formData.companySize,
                    industry: formData.industry,
                    website: formData.website,
                    country: formData.country,
                },
                window.location.origin + '/login'
            );

            const updatedProfile = useAuthStore.getState().profile;

            if (updatedProfile?.status === 'pending_approval') {
                navigate('/admin-lobby');
            } else {
                setIsSubmitted(true);
                window.scrollTo(0, 0);
            }
        } catch (err) {
            console.error("Admin signup failed:", err);
            let errMsg = err.message || "Signup failed. Please try again.";
            
            if (errMsg.includes("Password should contain at least") || errMsg.includes("Password must contain at least")) {
                errMsg = "Password must contain at least one lowercase letter, one uppercase letter, and one number.";
            } else if (errMsg.toLowerCase().includes("failed to fetch")) {
                errMsg = "Network Error: Failed to fetch. This usually happens if your browser's ad-blocker (like Brave Shields, uBlock Origin, etc.) is blocking Supabase requests. Please try disabling your ad-blocker for this site and refresh!";
            }
            
            setError(errMsg);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength <= 25) return "bg-red-500";
        if (passwordStrength <= 50) return "bg-orange-500";
        if (passwordStrength <= 75) return "bg-yellow-500";
        return "bg-emerald-500";
    };

    const getStrengthText = () => {
        if (passwordStrength <= 25) return "Weak";
        if (passwordStrength <= 50) return "Fair";
        if (passwordStrength <= 75) return "Good";
        return "Strong";
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] dark:from-[#102219] dark:via-[#142f22] dark:to-[#173a2a] text-slate-900 dark:text-slate-100 transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-100 dark:opacity-20" style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-[#1a2e24] rounded-3xl p-10 max-w-lg w-full text-center relative z-10 shadow-xl dark:shadow-slate-950/50 border border-[#f0fdf4] dark:border-[#2a4034]"
                >
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-50 dark:bg-[#102219] border border-emerald-100 dark:border-emerald-950/20">
                        <Mail className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="font-syne text-3xl font-black text-[#0f1f12] dark:text-emerald-400 tracking-tight mb-4">Check Your Email</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8">
                        Registration request received! We've sent a verification link to <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.email}</span>.
                    </p>
                    <div className="rounded-2xl p-6 text-left mb-8 bg-emerald-50 dark:bg-[#102219] border border-emerald-100 dark:border-[#2a4034]">
                        <h4 className="font-bold mb-2 flex items-center gap-2 text-[#0f1f12] dark:text-emerald-400">
                            <Info className="w-4 h-4" /> Next Steps:
                        </h4>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            <li className="flex gap-2"><span className="font-bold">1.</span> Verify your email by clicking the link in our message.</li>
                            <li className="flex gap-2"><span className="font-bold">2.</span> Your request will be reviewed by our Master Admin.</li>
                            <li className="flex gap-2"><span className="font-bold">3.</span> You'll receive a final confirmation once approved.</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full rounded-xl py-4 font-bold transition-all flex items-center justify-center text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-600/20"
                        onMouseEnter={(e) => { e.currentTarget.style.transform='translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform='translateY(0)'; }}
                    >
                        Return to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex overflow-hidden text-slate-900 dark:text-slate-100 bg-white dark:bg-[#102219] font-sans transition-colors duration-200" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Left Side: Branding/Hero */}
            <div className="hidden lg:flex w-5/12 items-center justify-center p-16 relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] dark:from-[#0a1811] dark:via-[#102219] dark:to-[#152a1e] border-r border-emerald-100 dark:border-emerald-950/20">
                <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-100 dark:opacity-20" style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }} />

                {/* Back to Home */}
                <Link to="/"
                    className="absolute top-8 left-8 flex items-center gap-2 z-10 transition-all text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 group"
                >
                    <div className="p-2 rounded-full bg-white dark:bg-[#1a2e24] border border-slate-200 dark:border-[#2a4034] group-hover:border-emerald-500 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold">Back to Home</span>
                </Link>

                <div className="relative z-10 max-w-md">
                    <div className="p-3 rounded-2xl w-fit mb-8 bg-[#16a34a]/10 border border-emerald-200 dark:border-emerald-800 cursor-pointer" onClick={() => navigate('/')}>
                        <BrainCircuit className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">Enterprise Edition</p>
                    <h1 className="font-syne text-4xl font-black text-[#0f1f12] dark:text-emerald-400 tracking-tight leading-tight mb-8">
                        Scale your <span className="text-emerald-600 dark:text-emerald-300">IT Support</span> globally.
                    </h1>

                    <div className="space-y-8">
                        {[{
                            icon: <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                            title: 'Company-wide Isolation',
                            desc: 'Secure data siloing for departments and multiple office locations.'
                        }, {
                            icon: <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                            title: 'Custom Dashboards',
                            desc: 'Tailored analytics and ticket routing for your industry specific needs.'
                        }, {
                            icon: <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
                            title: 'Admin Approval System',
                            desc: 'Multi-tenant architecture with human-verified vetting process.'
                        }].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#16a34a]/10 border border-emerald-200 dark:border-emerald-800">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-[#0f1f12] dark:text-slate-100 mb-1">{item.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* System Status Badge */}
                    <div className="mt-10 bg-white dark:bg-[#1a2e24] border border-emerald-100 dark:border-[#2a4034] rounded-2xl p-4 shadow-sm text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-3">
                            <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse bg-emerald-500" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5">System Status</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">All systems operational. 99.9% uptime.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Step Form */}
            <div className="flex-1 overflow-y-auto px-4 py-8 lg:p-12 relative flex flex-col items-center justify-start lg:justify-center bg-white dark:bg-[#102219] border-l border-emerald-50 dark:border-[#2a4034] transition-colors duration-200">

                {/* Expose Mobile Back to Home Navigation */}
                <Link to="/"
                    className="lg:hidden flex items-center gap-2 mb-8 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group w-fit self-start"
                >
                    <div className="p-2 rounded-full bg-slate-50 dark:bg-[#1a2e24] border border-slate-200 dark:border-[#2a4034]">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold">Back to Home</span>
                </Link>

                <div className="w-full max-w-2xl bg-white dark:bg-[#1a2e24] border border-emerald-50 dark:border-[#2a4034] rounded-[2rem] p-6 md:p-12 shadow-xl dark:shadow-slate-950/40 relative z-10">

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-12 max-w-md mx-auto relative">
                        {/* Connector Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-emerald-950/50 -translate-y-1/2 z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${(step - 1) * 50}%` }}
                        ></div>

                        {[1, 2, 3].map((s) => (
                            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    fontWeight: 700, fontSize: '14px', transition: 'all 0.3s',
                                    background: step >= s ? 'linear-gradient(135deg,#16a34a,#22c55e)' : (localStorage.getItem('theme') === 'dark' ? '#102219' : '#f9fafb'),
                                    color: step >= s ? '#fff' : '#9ca3af',
                                    border: step >= s ? 'none' : '2px solid ' + (localStorage.getItem('theme') === 'dark' ? '#2a4034' : '#e5e7eb'),
                                    boxShadow: step >= s ? '0 4px 12px rgba(34,160,69,0.25)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= s ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
                                    {s === 1 ? "Personal" : s === 2 ? "Company" : "Agreement"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-4"
                        >
                            <div className="rounded-full p-1 mt-0.5 bg-red-100 dark:bg-red-900/50">
                                <ShieldCheck className="w-3 h-3 text-red-600 dark:text-red-400 rotate-180" />
                            </div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); if (step === 3) handleSubmit(e); else nextStep(); }}>
                        <AnimatePresence mode="wait">
                            {/* STEP 1: PERSONAL INFO */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-emerald-400 font-syne">Personal Information</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Tell us who you are and create your admin account.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <User className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                required
                                                placeholder="Alex Mercer"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Work Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                placeholder="alex.mercer@acmecorp.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="+1 (415) 555-0198"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Briefcase className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Job Title
                                            </label>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                placeholder="Director of Operations"
                                                value={formData.jobTitle}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-[#2a4034]">
                                        <div className="space-y-2 text-left">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Create Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    required
                                                    placeholder="••••••••••"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm pr-11 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {/* Strength Meter */}
                                            {formData.password && (
                                                <div className="mt-2 space-y-2">
                                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                        <span>Strength: {getStrengthText()}</span>
                                                        <span>{passwordStrength}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-gray-100 dark:bg-emerald-950/40 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className={`h-full ${getStrengthColor()}`}
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${passwordStrength}%` }}
                                                        />
                                                    </div>
                                                    <div
                                                        aria-live="polite"
                                                        className={`text-[11px] font-semibold ${passwordWarning ? "text-red-600" : "text-emerald-700"}`}
                                                    >
                                                        {passwordWarning || "Password requirements met."}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Lock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    required
                                                    placeholder="••••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm pr-11 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all pr-11 focus:ring-4 focus:ring-emerald-500/5"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                         type="button"
                                         onClick={nextStep}
                                         className="w-full rounded-xl py-4 font-bold transition-all mt-8 flex items-center justify-center gap-2 text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-600/20"
                                     >
                                         Continue to Company Details <ChevronRight className="w-5 h-5" />
                                     </button>
                                </motion.div>
                            )}

                            {/* STEP 2: COMPANY DETAILS */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-emerald-400 font-syne">Company Details</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Tell us about the organization you're registering.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                            <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Company Name
                                        </label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            required
                                            placeholder="Acme Global Inc."
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <User className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Company Size
                                            </label>
                                            <Select
                                                name="companySize"
                                                value={formData.companySize}
                                                onChange={handleChange}
                                                placeholder="Select Size"
                                                options={[
                                                    { value: "1-10", label: "1-10 Employees" },
                                                    { value: "11-50", label: "11-50 Employees" },
                                                    { value: "51-200", label: "51-200 Employees" },
                                                    { value: "201-1000", label: "201-1,000 Employees" },
                                                    { value: "1000+", label: "1,000+ Employees" }
                                                ]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Briefcase className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Industry
                                            </label>
                                            <Select
                                                name="industry"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                placeholder="Select Industry"
                                                options={[
                                                    { value: "Technology", label: "Technology" },
                                                    { value: "Healthcare", label: "Healthcare" },
                                                    { value: "Finance", label: "Finance" },
                                                    { value: "Education", label: "Education" },
                                                    { value: "Retail", label: "Retail" },
                                                    { value: "Manufacturing", label: "Manufacturing" },
                                                    { value: "Other", label: "Other" }
                                                ]}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Company Website
                                            </label>
                                            <input
                                                type="url"
                                                name="website"
                                                placeholder="https://acme.com"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Country
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                required
                                                placeholder="United States"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5"
                                            />
                                        </div>
                                    </div>

                                     <div className="flex gap-4 pt-8">
                                         <button type="button" onClick={prevStep}
                                             className="flex-1 rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 bg-[#f9fafb] dark:bg-[#102219] text-[#374151] dark:text-slate-300 border border-[#e5e7eb] dark:border-[#2a4034]"
                                         >
                                             <ChevronLeft className="w-5 h-5" /> Back
                                         </button>
                                         <button type="button" onClick={nextStep}
                                             className="flex-[2] rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 text-white bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg"
                                         >
                                             Review &amp; Confirm <ChevronRight className="w-5 h-5" />
                                         </button>
                                     </div>
                                </motion.div>
                            )}

                            {/* STEP 3: AGREEMENT */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-emerald-400 font-syne">Final Confirmation</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Review our policies and submit your application.</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-[#102219] border border-gray-100 dark:border-[#2a4034] rounded-2xl p-6 space-y-4">
                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                name="agreedToTerms"
                                                checked={formData.agreedToTerms}
                                                onChange={handleChange}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                                            />
                                            <span className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                I agree to the <Link to="/terms" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline">Privacy Policy</Link>. I understand that my data will be stored securely.
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-4 cursor-pointer group pt-4 border-t border-gray-200/50 dark:border-emerald-950/20">
                                            <input
                                                type="checkbox"
                                                name="isAuthorized"
                                                checked={formData.isAuthorized}
                                                onChange={handleChange}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                                            />
                                            <span className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                I confirm that I am authorized to register <span className="font-bold text-gray-900 dark:text-slate-100 underline">{formData.companyName || "my company"}</span> on the HelpDesk.ai platform as a primary administrator.
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-8">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            disabled={loading}
                                            className="flex-1 bg-gray-100 dark:bg-[#102219] text-gray-700 dark:text-slate-300 rounded-xl py-4 font-bold hover:bg-gray-200 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-transparent dark:border-[#2a4034]"
                                        >
                                            <ChevronLeft className="w-5 h-5" /> Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] bg-emerald-900 dark:bg-emerald-800 text-white rounded-xl py-4 font-bold hover:bg-emerald-800 dark:hover:bg-emerald-750 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                            {loading ? "Processing..." : "Submit Registration"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <p className="text-center mt-12 text-slate-400 dark:text-slate-500 text-xs">
                        Secure enterprise registration portal. Your data is protected by 256-bit encryption.
                    </p>
                    <p className="text-center mt-4 text-slate-500 dark:text-slate-400 text-xs">
                        Are you an employee?{' '}
                        <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                            Join your team here →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminSignup;
