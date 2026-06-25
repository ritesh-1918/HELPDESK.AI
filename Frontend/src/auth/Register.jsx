import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Eye, EyeOff, BrainCircuit, ArrowRight,
    Loader2, CheckCircle2, ChevronRight,
    ChevronLeft, ShieldCheck, Mail,
    Building2, User, Lock, Phone,
    Briefcase, Globe, Info, ChevronDown,
    Search, ArrowLeft
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { supabase } from "../lib/supabaseClient";

/**
 * Register — Unified Registration Component
 * Combines user signup (join existing company) and admin signup (register new company)
 * Path: /register
 */
function Register() {
    // ─── Role Toggle ────────────────────────────────────────────────
    const [registrationType, setRegistrationType] = useState("user"); // "user" | "admin"

    // ─── Shared State ───────────────────────────────────────────────
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const navigate = useNavigate();
    const { signup, loading, user, profile } = useAuthStore();

    // ─── User Signup State ──────────────────────────────────────────
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Company Dropdown state (user signup)
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [companySearch, setCompanySearch] = useState("");
    const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
    const dropdownRef = useRef(null);

    // ─── Admin Signup State ─────────────────────────────────────────
    const [step, setStep] = useState(1);
    const [adminFormData, setAdminFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        jobTitle: "",
        password: "",
        confirmPassword: "",
        companyName: "",
        companySize: "",
        industry: "",
        website: "",
        country: "",
        agreedToTerms: false,
        isAuthorized: false,
    });
    const [passwordStrength, setPasswordStrength] = useState(0);

    // ─── Redirect if already logged in ──────────────────────────────
    useEffect(() => {
        if (user && profile) {
            if (profile.role === 'admin' || profile.role === 'super_admin') {
                navigate("/admin/dashboard");
            } else if (profile.status === "active") {
                navigate("/dashboard");
            } else if (profile.status === "pending_approval") {
                navigate(profile.role === "admin" ? "/admin-lobby" : "/user-lobby");
            }
        }
    }, [user, profile, navigate]);

    // ─── Fetch companies for user signup ────────────────────────────
    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoadingCompanies(true);
            const { data, error } = await supabase
                .from('companies')
                .select('id, name')
                .eq('status', 'active')
                .order('name');

            if (data) {
                setCompanies(data);
                setFilteredCompanies(data);
            }
            if (error) console.error("Error fetching companies:", error);
            setIsLoadingCompanies(false);
        };

        fetchCompanies();

        const channel = supabase
            .channel('public:companies')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'companies' },
                () => { fetchCompanies(); }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter companies
    useEffect(() => {
        if (companySearch.trim() === "") {
            setFilteredCompanies(companies);
        } else {
            const lowerSearch = companySearch.toLowerCase();
            setFilteredCompanies(
                companies.filter((c) => c.name.toLowerCase().includes(lowerSearch))
            );
        }
    }, [companySearch, companies]);

    // ─── Admin password strength ────────────────────────────────────
    useEffect(() => {
        const pw = adminFormData.password;
        let strength = 0;
        if (pw.length >= 8) strength += 25;
        if (/[A-Z]/.test(pw)) strength += 25;
        if (/[0-9]/.test(pw)) strength += 25;
        if (/[^A-Za-z0-9]/.test(pw)) strength += 25;
        setPasswordStrength(strength);
    }, [adminFormData.password]);

    // ─── Password validator ─────────────────────────────────────────
    const validatePassword = (pw) => {
        if (pw.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[a-z]/.test(pw)) return 'Password must contain at least one lowercase letter (a-z).';
        if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter (A-Z).';
        if (!/[0-9]/.test(pw)) return 'Password must contain at least one number (0-9).';
        return null;
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

    // ─── Admin form handlers ────────────────────────────────────────
    const handleAdminChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdminFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        setError("");
    };

    const nextStep = () => {
        if (step === 1) {
            if (!adminFormData.fullName || !adminFormData.email || !adminFormData.password || !adminFormData.confirmPassword) {
                setError("Please fill in all required personal information.");
                return;
            }
            const pwError = validatePassword(adminFormData.password);
            if (pwError) { setError(pwError); return; }
            if (adminFormData.password !== adminFormData.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
        } else if (step === 2) {
            if (!adminFormData.companyName || !adminFormData.companySize || !adminFormData.industry || !adminFormData.country) {
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

    // ─── User Signup Handler ────────────────────────────────────────
    const handleUserSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password || !confirmPassword || !fullName) {
            setError("All fields are required.");
            return;
        }
        if (!selectedCompany) {
            setError("Please select your company.");
            return;
        }
        const pwError = validatePassword(password);
        if (pwError) { setError(pwError); return; }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const newUser = await signup(
                email, password, fullName, 'user',
                selectedCompany.name,
                { company_id: selectedCompany.id },
                window.location.origin + '/login'
            );

            if (newUser) {
                const updatedProfile = useAuthStore.getState().profile;
                if (updatedProfile?.status === 'pending_approval') {
                    navigate('/user-lobby');
                } else {
                    setSuccessMsg(`📧 Check your email! We sent a verification link to ${email}. After verifying your email, your request will be reviewed by your company admin.`);
                }
            }
        } catch (err) {
            console.error("Signup component error:", err);
            let errMsg = err.message || "Signup failed. Please try again.";
            if (errMsg.toLowerCase().includes("failed to fetch")) {
                errMsg = "Network Error: Failed to fetch. This usually happens if your browser's ad-blocker (like Brave Shields, uBlock Origin, etc.) is blocking Supabase requests. Please try disabling your ad-blocker for this site and refresh!";
            }
            setError(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Admin Signup Handler ───────────────────────────────────────
    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        if (!adminFormData.agreedToTerms || !adminFormData.isAuthorized) {
            setError("You must agree to the terms and authorize company registration.");
            return;
        }

        try {
            await signup(
                adminFormData.email,
                adminFormData.password,
                adminFormData.fullName,
                'admin',
                adminFormData.companyName,
                {
                    phone: adminFormData.phone,
                    job_title: adminFormData.jobTitle,
                    company_size: adminFormData.companySize,
                    industry: adminFormData.industry,
                    website: adminFormData.website,
                    country: adminFormData.country,
                },
                window.location.origin + '/login'
            );

            const updatedProfile = useAuthStore.getState().profile;
            if (updatedProfile?.status === 'pending_approval') {
                navigate('/admin-lobby');
            } else {
                setSuccessMsg("Registration request received! We've sent a verification link to " + adminFormData.email + ". Please verify your email, then your request will be reviewed by our Master Admin.");
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

    // ─── Shared Styles ──────────────────────────────────────────────
    const inputStyle = {
        width: '100%', background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: '12px',
        padding: '13px 16px', fontSize: '15px', color: '#111827', outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };
    const inputFocus = (e) => { e.target.style.borderColor = '#22c55e'; e.target.style.boxShadow = '0 0 0 3px rgba(34,160,69,0.1)'; };
    const inputBlur = (e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; };
    const labelStyle = { fontSize: '12px', fontWeight: 600, color: '#374151', letterSpacing: '0.05em', textTransform: 'uppercase' };

    // ─── Success Screen ─────────────────────────────────────────────
    if (successMsg) {
        return (
            <div
                className="min-h-screen flex items-center justify-center relative overflow-hidden p-6"
                style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}
            >
                <div
                    className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }}
                />
                <div className="w-full max-w-md bg-white rounded-3xl p-8 relative z-10 text-center" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f0fdf4' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: '#f0fdf4', border: '1px solid #d1fae5' }}>
                        <CheckCircle2 className="w-8 h-8" style={{ color: '#16a34a' }} />
                    </div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: '#0f1f12', marginBottom: '16px' }}>Registration Successful</h2>
                    <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px' }}>{successMsg}</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl transition-all"
                        style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#ffffff', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(34,160,69,0.3)' }}
                    >
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    // ═════════════════════════════════════════════════════════════════
    // USER SIGNUP FORM
    // ═════════════════════════════════════════════════════════════════
    const renderUserSignup = () => (
        <form onSubmit={handleUserSignup} className="space-y-5">
            {/* Company Dropdown */}
            <div className="relative" ref={dropdownRef}>
                <label htmlFor="company-select" className="block mb-2" style={labelStyle}>Company</label>
                <input type="hidden" id="company_id" name="company_id" value={selectedCompany ? selectedCompany.id : ''} />
                <input type="text" id="company-hidden" name="organization" autoComplete="organization" value={selectedCompany ? selectedCompany.name : ''} readOnly aria-hidden="true" style={{position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden'}} />
                <div
                    id="company-select"
                    role="combobox"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="listbox"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ ...inputStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: isDropdownOpen ? '#22c55e' : '#e5e7eb', boxShadow: isDropdownOpen ? '0 0 0 3px rgba(34,160,69,0.1)' : 'none' }}>
                    {selectedCompany ? (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: '#f0fdf4' }}><Building2 className="w-3.5 h-3.5" style={{ color: '#16a34a' }} /></div>
                            <span style={{ fontWeight: 600, color: '#111827' }}>{selectedCompany.name}</span>
                        </div>
                    ) : (<span style={{ color: '#9ca3af', fontWeight: 500 }}>Select your company...</span>)}
                    <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} style={{ color: '#9ca3af' }} />
                </div>

                {isDropdownOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white overflow-hidden" style={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} role="listbox">
                        <div className="p-2 flex items-center gap-2" style={{ borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                            <Search className="w-4 h-4 ml-2" style={{ color: '#9ca3af' }} />
                            <input
                                id="company-search"
                                type="text"
                                placeholder="Search companies..."
                                aria-label="Search companies"
                                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', padding: '4px 0', color: '#111827' }}
                                value={companySearch}
                                onChange={(e) => setCompanySearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()} />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1">
                            {isLoadingCompanies ? (
                                <div className="py-6 flex flex-col items-center justify-center gap-2 opacity-50">
                                    <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#22c55e', borderTopColor: 'transparent' }}></div>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>Loading companies...</span>
                                </div>
                            ) : filteredCompanies.length > 0 ? (
                                filteredCompanies.map((c) => (
                                    <div
                                        key={c.id}
                                        onClick={() => { setSelectedCompany(c); setIsDropdownOpen(false); setCompanySearch(""); }}
                                        role="option"
                                        aria-selected={selectedCompany?.id === c.id}
                                        className="px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-3 transition-colors hover:bg-green-50 group">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ border: '1px solid #e5e7eb', background: '#fff' }}>
                                            <Building2 className="w-4 h-4 transition-colors" style={{ color: '#9ca3af' }} />
                                        </div>
                                        <span style={{ fontWeight: 600, color: '#374151' }}>{c.name}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-6 text-center rounded-lg mx-1 my-1" style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', background: '#f9fafb', border: '1px dashed #e5e7eb' }}>
                                    No companies found.<br />
                                    <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', display: 'block', fontWeight: 400 }}>Ask your IT Admin to register your company first.</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Full Name */}
            <div>
                <label htmlFor="fullName" className="block mb-2" style={labelStyle}>Full Name</label>
                <input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    type="text"
                    placeholder="Enter your name"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setError(""); }}
                    required
                    aria-required="true" />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block mb-2" style={labelStyle}>Email Address</label>
                <input
                    id="email"
                    name="email"
                    autoComplete="email"
                    type="email"
                    placeholder="Enter your system email"
                    style={inputStyle}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    required
                    aria-required="true" />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <label htmlFor="password" className="block mb-2" style={labelStyle}>Password</label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min 8 chars"
                            style={{ ...inputStyle, paddingRight: '44px' }}
                            onFocus={inputFocus}
                            onBlur={inputBlur}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            required
                            aria-required="true"
                            aria-describedby="password-requirements" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {/* Live password requirement checklist */}
                    {password && (
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2" id="password-requirements">
                            {[
                                { label: '8+ characters', ok: password.length >= 8 },
                                { label: 'Uppercase (A-Z)', ok: /[A-Z]/.test(password) },
                                { label: 'Lowercase (a-z)', ok: /[a-z]/.test(password) },
                                { label: 'Number (0-9)', ok: /[0-9]/.test(password) },
                            ].map(({ label, ok }) => (
                                <span key={label} className={`text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                    ok ? 'text-emerald-600' : 'text-red-400'
                                }`}>
                                    <span>{ok ? '✓' : '○'}</span> {label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="relative">
                    <label htmlFor="confirmPassword" className="block mb-2" style={labelStyle}>Confirm</label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            autoComplete="new-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repeat"
                            style={{ ...inputStyle, paddingRight: '44px' }}
                            onFocus={inputFocus}
                            onBlur={inputBlur}
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                            required
                            aria-required="true" />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', borderRadius: '12px', padding: '14px', fontWeight: 600, fontSize: '15px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,160,69,0.3)', transition: 'transform 0.2s, box-shadow 0.2s', marginTop: '8px' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(34,160,69,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,160,69,0.3)'; }}>
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isSubmitting ? "Creating Profile..." : "Submit Registration"}
            </button>
        </form>
    );

    // ═════════════════════════════════════════════════════════════════
    // ADMIN SIGNUP FORM (Multi-step)
    // ═════════════════════════════════════════════════════════════════
    const renderAdminSignup = () => (
        <form onSubmit={handleAdminSubmit}>
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mb-10 max-w-sm mx-auto relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500"
                    style={{ width: `${(step - 1) * 50}%` }}
                ></div>

                {[1, 2, 3].map((s) => (
                    <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '13px', transition: 'all 0.3s',
                            background: step >= s ? 'linear-gradient(135deg,#16a34a,#22c55e)' : '#f9fafb',
                            color: step >= s ? '#fff' : '#9ca3af',
                            border: step >= s ? 'none' : '2px solid #e5e7eb',
                            boxShadow: step >= s ? '0 4px 12px rgba(34,160,69,0.25)' : 'none'
                        }}>
                            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                        </div>
                        <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.08em', color: step >= s ? '#16a34a' : '#9ca3af' }}>
                            {s === 1 ? "Personal" : s === 2 ? "Company" : "Agreement"}
                        </span>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 1: PERSONAL INFO */}
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="admin-fullName" className="block mb-2" style={labelStyle}>
                                    <User className="w-3 h-3 inline mr-1" /> Full Name
                                </label>
                                <input
                                    id="admin-fullName"
                                    type="text"
                                    name="fullName"
                                    autoComplete="name"
                                    required
                                    aria-required="true"
                                    placeholder="Alex Mercer"
                                    value={adminFormData.fullName}
                                    onChange={handleAdminChange}
                                    style={inputStyle}
                                    onFocus={inputFocus}
                                    onBlur={inputBlur}
                                />
                            </div>
                            <div>
                                <label htmlFor="admin-email" className="block mb-2" style={labelStyle}>
                                    <Mail className="w-3 h-3 inline mr-1" /> Work Email
                                </label>
                                <input
                                    id="admin-email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    required
                                    aria-required="true"
                                    placeholder="alex@acmecorp.com"
                                    value={adminFormData.email}
                                    onChange={handleAdminChange}
                                    style={inputStyle}
                                    onFocus={inputFocus}
                                    onBlur={inputBlur}
                                />
                            </div>
                            <div>
                                <label htmlFor="admin-phone" className="block mb-2" style={labelStyle}>
                                    <Phone className="w-3 h-3 inline mr-1" /> Phone Number
                                </label>
                                <input
                                    id="admin-phone"
                                    type="tel"
                                    name="phone"
                                    autoComplete="tel"
                                    placeholder="+1 (415) 555-0198"
                                    value={adminFormData.phone}
                                    onChange={handleAdminChange}
                                    style={inputStyle}
                                    onFocus={inputFocus}
                                    onBlur={inputBlur}
                                />
                            </div>
                            <div>
                                <label htmlFor="admin-jobTitle" className="block mb-2" style={labelStyle}>
                                    <Briefcase className="w-3 h-3 inline mr-1" /> Job Title
                                </label>
                                <input
                                    id="admin-jobTitle"
                                    type="text"
                                    name="jobTitle"
                                    autoComplete="organization-title"
                                    placeholder="Director of Operations"
                                    value={adminFormData.jobTitle}
                                    onChange={handleAdminChange}
                                    style={inputStyle}
                                    onFocus={inputFocus}
                                    onBlur={inputBlur}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <label htmlFor="admin-password" className="block mb-2" style={labelStyle}>
                                    <Lock className="w-3 h-3 inline mr-1" /> Create Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="admin-password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="new-password"
                                        required
                                        aria-required="true"
                                        aria-describedby="admin-password-requirements"
                                        placeholder="••••••••••"
                                        value={adminFormData.password}
                                        onChange={handleAdminChange}
                                        style={{ ...inputStyle, paddingRight: '44px' }}
                                        onFocus={inputFocus}
                                        onBlur={inputBlur}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {/* Password Requirements */}
                                <div className="mt-2 space-y-1" id="admin-password-requirements">
                                    {adminFormData.password && (
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            <span>Strength: {getStrengthText()}</span>
                                            <span>{passwordStrength}%</span>
                                        </div>
                                    )}
                                    {adminFormData.password && (
                                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${getStrengthColor()}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${passwordStrength}%` }}
                                            />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                                        {[
                                            { label: '8+ characters', ok: adminFormData.password.length >= 8 },
                                            { label: 'Uppercase (A-Z)', ok: /[A-Z]/.test(adminFormData.password) },
                                            { label: 'Lowercase (a-z)', ok: /[a-z]/.test(adminFormData.password) },
                                            { label: 'Number (0-9)', ok: /[0-9]/.test(adminFormData.password) },
                                        ].map(({ label, ok }) => (
                                            <span key={label} className={`text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                                                adminFormData.password ? (ok ? 'text-emerald-600' : 'text-red-400') : 'text-gray-300'
                                            }`}>
                                                <span>{ok ? '✓' : '○'}</span> {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="admin-confirmPassword" className="block mb-2" style={labelStyle}>
                                    <Lock className="w-3 h-3 inline mr-1" /> Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="admin-confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        required
                                        aria-required="true"
                                        placeholder="••••••••••"
                                        value={adminFormData.confirmPassword}
                                        onChange={handleAdminChange}
                                        style={{ ...inputStyle, paddingRight: '44px' }}
                                        onFocus={inputFocus}
                                        onBlur={inputBlur}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={nextStep}
                            className="w-full flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', borderRadius: '12px', padding: '14px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '15px', boxShadow: '0 4px 20px rgba(34,160,69,0.3)', marginTop: '8px' }}
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
                        className="space-y-5"
                    >
                        <div>
                            <label htmlFor="admin-companyName" className="block mb-2" style={labelStyle}>
                                <Building2 className="w-3 h-3 inline mr-1" /> Company Name
                            </label>
                            <input
                                id="admin-companyName"
                                type="text"
                                name="companyName"
                                autoComplete="organization"
                                required
                                aria-required="true"
                                placeholder="Acme Global Inc."
                                value={adminFormData.companyName}
                                onChange={handleAdminChange}
                                style={inputStyle}
                                onFocus={inputFocus}
                                onBlur={inputBlur}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="admin-companySize" className="block mb-2" style={labelStyle}>
                                    <User className="w-3 h-3 inline mr-1" /> Company Size
                                </label>
                                <select
                                    id="admin-companySize"
                                    name="companySize"
                                    value={adminFormData.companySize}
                                    onChange={handleAdminChange}
                                    required
                                    aria-required="true"
                                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                                    onFocus={inputFocus}
                                    onBlur={inputBlur}
                                >
                                    <option value="">Select Size</option>
                                    <option value="1-10">1-10 Employees</option>
                                    <option value="11-50">11-50 Employees</option>
                                    <option value="51-200">51-200 Employees</option>
                                    <option value="201-1000">201-1,000 Employees</option>
                                    <option value="1000+">1,000+ Employees</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="admin-industry" className="block mb-2" style={labelStyle}>
                                    <Briefcase className="w-3 h-3 inline mr-1" /> Industry
                                </label>
                                <select
                                    id="admin-industry"
                                    name="industry"
                                    value={adminFormData.industry}
                                    onChange={handleAdminChange}
                                    required
                                    aria-required="true"
                                    style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}
                                    onFocus={inputFocus}
                                    onBlur={inputBlur}
                                >
                                    <option value="">Select Industry</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Education">Education</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="admin-website" className="block mb-2" style={labelStyle}>
                                    <Globe className="w-3 h-3 inline mr-1" /> Company Website
                                </label>
                                <input
                                    id="admin-website"
                                    type="url"
                                    name="website"
                                    autoComplete="url"
                                    placeholder="https://acme.com"
                                    value={adminFormData.website}
                                    onChange={handleAdminChange}
                                    style={inputStyle}
                                    onFocus={inputFocus}
                                    onBlur={inputBlur}
                                />
                            </div>
                            <div>
                                <label htmlFor="admin-country" className="block mb-2" style={labelStyle}>
                                    <Globe className="w-3 h-3 inline mr-1" /> Country
                                </label>
                                <input
                                    id="admin-country"
                                    type="text"
                                    name="country"
                                    autoComplete="country-name"
                                    required
                                    aria-required="true"
                                    placeholder="United States"
                                    value={adminFormData.country}
                                    onChange={handleAdminChange}
                                    style={inputStyle}
                                    onFocus={inputFocus}
                                    onBlur={inputBlur}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={prevStep}
                                className="flex-1 flex items-center justify-center gap-2"
                                style={{ background: '#f9fafb', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '14px', cursor: 'pointer', fontWeight: 600 }}
                                onMouseEnter={(e) => e.currentTarget.style.background='#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.background='#f9fafb'}
                            >
                                <ChevronLeft className="w-5 h-5" /> Back
                            </button>
                            <button type="button" onClick={nextStep}
                                className="flex-[2] flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 20px rgba(34,160,69,0.3)' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform='translateY(-1px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform='translateY(0)'}
                            >
                                Review & Confirm <ChevronRight className="w-5 h-5" />
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
                        className="space-y-5"
                    >
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 space-y-4">
                            <label htmlFor="admin-agreedToTerms" className="flex items-start gap-4 cursor-pointer group">
                                <input
                                    id="admin-agreedToTerms"
                                    type="checkbox"
                                    name="agreedToTerms"
                                    checked={adminFormData.agreedToTerms}
                                    onChange={handleAdminChange}
                                    required
                                    aria-required="true"
                                    className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                                />
                                <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                                    I agree to the <Link to="/terms" className="text-emerald-700 font-bold hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-emerald-700 font-bold hover:underline">Privacy Policy</Link>. I understand that my data will be stored securely.
                                </span>
                            </label>
                            <label htmlFor="admin-isAuthorized" className="flex items-start gap-4 cursor-pointer group pt-4 border-t border-gray-200/50">
                                <input
                                    id="admin-isAuthorized"
                                    type="checkbox"
                                    name="isAuthorized"
                                    checked={adminFormData.isAuthorized}
                                    onChange={handleAdminChange}
                                    required
                                    aria-required="true"
                                    className="mt-1 w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                                />
                                <span className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                                    I confirm that I am authorized to register <span className="font-bold text-gray-900 underline">{adminFormData.companyName || "my company"}</span> on the HelpDesk.ai platform as a primary administrator.
                                </span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2"
                                style={{ background: '#f9fafb', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', padding: '14px', cursor: 'pointer', fontWeight: 600 }}
                            >
                                <ChevronLeft className="w-5 h-5" /> Back
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 20px rgba(34,160,69,0.3)' }}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                {loading ? "Processing..." : "Submit Registration"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    );

    // ═════════════════════════════════════════════════════════════════
    // MAIN RENDER
    // ═════════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 py-12" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}>
            <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }} />

            {/* Back Button */}
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 transition-all group"
                style={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
            >
                <div className="p-2 rounded-full transition-all" style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <span>Back to Home</span>
            </Link>

            <div className="w-full max-w-lg relative z-10">
                {/* Logo Header */}
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full transition" style={{ background: 'rgba(34,160,69,0.08)', border: '1px solid #d1fae5' }}>
                        <BrainCircuit className="w-5 h-5" style={{ color: '#16a34a' }} />
                        <span style={{ fontWeight: 800, fontSize: '18px', color: '#0f1f12' }}>HelpDesk.ai</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f0fdf4' }}>
                    <div className="text-center" style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0f1f12', letterSpacing: '-0.02em', marginBottom: '8px' }}>Create Account</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>
                            {registrationType === "user" ? "Join your team and start automating IT support" : "Register your company on HelpDesk.ai"}
                        </p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex rounded-xl p-1 mb-6" style={{ background: '#f3f4f6' }}>
                        <button
                            type="button"
                            onClick={() => { setRegistrationType("user"); setError(""); setStep(1); }}
                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            style={{
                                background: registrationType === "user" ? '#ffffff' : 'transparent',
                                color: registrationType === "user" ? '#111827' : '#6b7280',
                                boxShadow: registrationType === "user" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <User className="w-4 h-4" /> Employee
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRegistrationType("admin"); setError(""); }}
                            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                            style={{
                                background: registrationType === "admin" ? '#ffffff' : 'transparent',
                                color: registrationType === "admin" ? '#111827' : '#6b7280',
                                boxShadow: registrationType === "admin" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <ShieldCheck className="w-4 h-4" /> Company Admin
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-start gap-3" style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '14px 16px' }}>
                            <div className="rounded-full p-1 mt-0.5" style={{ background: '#fee2e2' }}><ArrowRight className="w-3 h-3 text-red-600 rotate-45" /></div>
                            <p className="text-sm font-medium" style={{ color: '#b91c1c' }}>{error}</p>
                        </div>
                    )}

                    {registrationType === "user" ? renderUserSignup() : renderAdminSignup()}

                    <p className="text-center" style={{ fontSize: '14px', color: '#6b7280', marginTop: '24px' }}>
                        Already have an account?{" "}
                        <Link to="/login" className="hover:underline transition-all" style={{ color: '#16a34a', fontWeight: 600 }}>Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
