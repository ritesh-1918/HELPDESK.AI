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

        try {
            // Trigger Supabase Signup
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

            // After signup, the store's 'profile' should be updated.
            // If email confirmation is OFF in Supabase, status will usually be 'pending_approval' immediately.
            const updatedProfile = useAuthStore.getState().profile;

            if (updatedProfile?.status === 'pending_approval') {
                // Email was auto-verified, go straight to lobby
                navigate('/admin-lobby');
            } else {
                // Email verification is required, show the success screen
                setIsSubmitted(true);
                window.scrollTo(0, 0);
            }
        } catch (err) {
            console.error("Admin signup failed:", err);
            let errMsg = err.message || "Signup failed. Please try again.";
            if (errMsg.toLowerCase().includes("failed to fetch")) {
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
            <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}>
                <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-10 max-w-lg w-full text-center relative z-10"
                    style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f0fdf4' }}
                >
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}>
                        <Mail className="w-10 h-10" style={{ color: '#16a34a' }} />
                    </div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0f1f12', letterSpacing: '-0.02em', marginBottom: '16px' }}>Check Your Email</h2>
                    <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.7, marginBottom: '32px' }}>
                        Registration request received! We've sent a verification link to <span style={{ fontWeight: 700, color: '#16a34a' }}>{formData.email}</span>.
                    </p>
                    <div className="rounded-2xl p-6 text-left mb-8" style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}>
                        <h4 className="font-bold mb-2 flex items-center gap-2" style={{ color: '#0f1f12' }}>
                            <Info className="w-4 h-4" style={{ color: '#16a34a' }} /> Next Steps:
                        </h4>
                        <ul className="space-y-3" style={{ fontSize: '14px', color: '#374151' }}>
                            <li className="flex gap-2"><span className="font-bold">1.</span> Verify your email by clicking the link in our message.</li>
                            <li className="flex gap-2"><span className="font-bold">2.</span> Your request will be reviewed by our Master Admin.</li>
                            <li className="flex gap-2"><span className="font-bold">3.</span> You'll receive a final confirmation once approved.</li>
                        </ul>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full rounded-xl py-4 font-bold transition-all flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,160,69,0.3)', fontSize: '15px', fontWeight: 600 }}
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
        <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* Left Side: Branding/Hero */}
            <div className="hidden lg:flex w-5/12 items-center justify-center p-16 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}>
                <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }} />

                {/* Back to Home */}
                <Link to="/"
                    className="absolute top-8 left-8 flex items-center gap-2 z-10 transition-all"
                    style={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
                >
                    <div className="p-2 rounded-full" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span>Back to Home</span>
                </Link>

                <div className="relative z-10 max-w-md">
                    <div className="p-3 rounded-2xl w-fit mb-8 cursor-pointer" style={{ background: 'rgba(34,160,69,0.08)', border: '1px solid #d1fae5' }} onClick={() => navigate('/')}>
                        <BrainCircuit className="w-10 h-10" style={{ color: '#16a34a' }} />
                    </div>
                    <p style={{ color: '#16a34a', fontWeight: 700, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Enterprise Edition</p>
                    <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '42px', fontWeight: 800, color: '#0f1f12', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '32px' }}>
                        Scale your <span style={{ color: '#16a34a' }}>IT Support</span> globally.
                    </h1>

                    <div className="space-y-8">
                        {[{
                            icon: <ShieldCheck className="w-6 h-6" style={{ color: '#16a34a' }} />,
                            title: 'Company-wide Isolation',
                            desc: 'Secure data siloing for departments and multiple office locations.'
                        }, {
                            icon: <Building2 className="w-6 h-6" style={{ color: '#16a34a' }} />,
                            title: 'Custom Dashboards',
                            desc: 'Tailored analytics and ticket routing for your industry specific needs.'
                        }, {
                            icon: <User className="w-6 h-6" style={{ color: '#16a34a' }} />,
                            title: 'Admin Approval System',
                            desc: 'Multi-tenant architecture with human-verified vetting process.'
                        }].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(34,160,69,0.08)', border: '1px solid #d1fae5' }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 700, fontSize: '16px', color: '#0f1f12', marginBottom: '4px' }}>{item.title}</h4>
                                    <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* System Status Badge */}
                    <div className="mt-10" style={{ background: '#ffffff', border: '1px solid #d1fae5', borderRadius: '14px', padding: '14px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div className="flex items-center gap-3">
                            <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>System Status</p>
                                <p style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>All systems operational. 99.9% uptime.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Step Form */}
            <div className="flex-1 overflow-y-auto px-4 py-8 lg:p-12 relative flex justify-center items-start lg:items-center" style={{ background: '#ffffff', borderLeft: '1px solid #f0fdf4' }}>

                <div className="w-full max-w-2xl bg-white rounded-[2rem] p-6 md:p-12 my-auto relative z-10" style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.06)', border: '1px solid #f0fdf4' }}>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-12 max-w-md mx-auto relative">
                        {/* Connector Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${(step - 1) * 50}%` }}
                        ></div>

                        {[1, 2, 3].map((s) => (
                            <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '14px', transition: 'all 0.3s',
                                    background: step >= s ? 'linear-gradient(135deg,#16a34a,#22c55e)' : '#f9fafb',
                                    color: step >= s ? '#fff' : '#9ca3af',
                                    border: step >= s ? 'none' : '2px solid #e5e7eb',
                                    boxShadow: step >= s ? '0 4px 12px rgba(34,160,69,0.25)' : 'none'
                                }}>
                                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                </div>
                                <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', color: step >= s ? '#16a34a' : '#9ca3af' }}>
                                    {s === 1 ? "Personal" : s === 2 ? "Company" : "Agreement"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 flex items-start gap-3"
                            style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '14px 16px' }}
                        >
                            <div className="rounded-full p-1 mt-0.5" style={{ background: '#fee2e2' }}>
                                <ShieldCheck className="w-3 h-3 text-red-600 rotate-180" />
                            </div>
                            <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit}>
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
                                        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                                        <p className="text-gray-500 text-sm">Tell us who you are and create your admin account.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <User className="w-3 h-3" /> Full Name
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                required
                                                placeholder="Alex Mercer"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Mail className="w-3 h-3" /> Work Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                placeholder="alex.mercer@acmecorp.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="+1 (415) 555-0198"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Briefcase className="w-3 h-3" /> Job Title
                                            </label>
                                            <input
                                                type="text"
                                                name="jobTitle"
                                                placeholder="Director of Operations"
                                                value={formData.jobTitle}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                        <div className="space-y-2 text-left">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Lock className="w-3 h-3" /> Create Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    required
                                                    placeholder="••••••••••"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none transition-all pr-11"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
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
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Lock className="w-3 h-3" /> Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    required
                                                    placeholder="••••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white outline-none transition-all pr-11"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                         type="button"
                                         onClick={nextStep}
                                         className="w-full rounded-xl py-4 font-bold transition-all mt-8 flex items-center justify-center gap-2"
                                         style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,160,69,0.3)', fontSize: '15px', fontWeight: 600 }}
                                         onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-1px)'}
                                         onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}
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
                                        <h2 className="text-2xl font-bold text-gray-900">Company Details</h2>
                                        <p className="text-gray-500 text-sm">Tell us about the organization you're registering.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                            <Building2 className="w-3 h-3" /> Company Name
                                        </label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            required
                                            placeholder="Acme Global Inc."
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-50 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <User className="w-3 h-3" /> Company Size
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
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Briefcase className="w-3 h-3" /> Industry
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
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> Company Website
                                            </label>
                                            <input
                                                type="url"
                                                name="website"
                                                placeholder="https://acme.com"
                                                value={formData.website}
                                                onChange={handleChange}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-50 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Globe className="w-3 h-3" /> Country
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                required
                                                placeholder="United States"
                                                value={formData.country}
                                                onChange={handleChange}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-50 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                         <div className="flex gap-4 pt-8">
                                         <button type="button" onClick={prevStep}
                                             className="flex-1 rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2"
                                             style={{ background: '#f9fafb', color: '#374151', border: '1.5px solid #e5e7eb', cursor: 'pointer' }}
                                             onMouseEnter={(e) => e.currentTarget.style.background='#f3f4f6'}
                                             onMouseLeave={(e) => e.currentTarget.style.background='#f9fafb'}
                                         >
                                             <ChevronLeft className="w-5 h-5" /> Back
                                         </button>
                                         <button type="button" onClick={nextStep}
                                             className="flex-[2] rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2"
                                             style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,160,69,0.3)', fontWeight: 600 }}
                                             onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-1px)'}
                                             onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}
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
                                        <h2 className="text-2xl font-bold text-gray-900">Final Confirmation</h2>
                                        <p className="text-gray-500 text-sm">Review our policies and submit your application.</p>
                                    </div>

                                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                                        <label className="flex items-start gap-4 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                name="agreedToTerms"
                                                checked={formData.agreedToTerms}
                                                onChange={handleChange}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                                            />
                                            <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                                                I agree to the <Link to="/terms" className="text-emerald-700 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-emerald-700 font-bold hover:underline">Privacy Policy</Link>. I understand that my data will be stored securely.
                                            </span>
                                        </label>
                                        <label className="flex items-start gap-4 cursor-pointer group pt-4 border-t border-gray-200/50">
                                            <input
                                                type="checkbox"
                                                name="isAuthorized"
                                                checked={formData.isAuthorized}
                                                onChange={handleChange}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                                            />
                                            <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                                                I confirm that I am authorized to register <span className="font-bold text-gray-900 underline">{formData.companyName || "my company"}</span> on the HelpDesk.ai platform as a primary administrator.
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex gap-4 pt-8">
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            disabled={loading}
                                            className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-4 font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ChevronLeft className="w-5 h-5" /> Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-[2] bg-emerald-900 text-white rounded-xl py-4 font-bold hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                            {loading ? "Processing..." : "Submit Registration"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <p className="text-center mt-12" style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Secure enterprise registration portal. Your data is protected by 256-bit encryption.
                    </p>
                    <p className="text-center mt-4" style={{ fontSize: '12px', color: '#6b7280' }}>
                        Are you an employee?{' '}
                        <Link to="/signup" style={{ color: '#16a34a', fontWeight: 700 }} className="hover:underline">
                            Join your team here →
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminSignup;
