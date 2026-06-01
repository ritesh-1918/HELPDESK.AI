import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { supabase } from "../lib/supabaseClient";
import { Eye, EyeOff, BrainCircuit, ArrowRight, Loader2, CheckCircle2, ChevronDown, Search, Building2, ArrowLeft } from "lucide-react";
import { getPasswordValidation, getPasswordValidationMessage } from "../utils/passwordValidation";

function Signup() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Company Dropdown state
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { signup, loginWithGoogle, loading, user, profile } = useAuthStore();
  const passwordRules = { minLength: 6 };
  const passwordChecks = getPasswordValidation(password, passwordRules);
  const passwordWarning = getPasswordValidationMessage(passwordChecks, passwordRules);
  const confirmPasswordWarning = confirmPassword && password !== confirmPassword ? "Passwords do not match." : "";

  // Fetch and subscribe to companies
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

    // Realtime subscription for companies
    const channel = supabase
      .channel('public:companies')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'companies' },
        () => {
          fetchCompanies(); // Refetch on any change
        }
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

  // Redirect if already logged in and active
  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin' || profile.role === 'super_admin') {
        navigate("/admin/dashboard");
      } else if (profile.status === "active") {
        navigate("/dashboard");
      } else if (profile.status === "pending_approval") {
        navigate("/user-lobby");
      }
    }
  }, [user, profile, navigate]);

  const handleSignup = async (e) => {
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

    if (passwordWarning) {
      setError(passwordWarning);
      return;
    }

    if (confirmPasswordWarning) {
      setError(confirmPasswordWarning);
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await signup(
        email,
        password,
        fullName,
        'user',
        selectedCompany.name,
        {
          company_id: selectedCompany.id
        },
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
      let errMsg = err.message || "Signup failed. Please try again.";
      // Handle Supabase password validation errors
      if (errMsg.includes("Password should contain") || errMsg.includes("at least one character")) {
        errMsg = "Password must contain at least: 8 characters, one uppercase letter (A-Z), one lowercase letter (a-z), and one number (0-9).";
      }
      console.error("Signup component error:", err);
      
      if (errMsg.toLowerCase().includes("failed to fetch")) {
        errMsg = "Network Error: Failed to fetch. This usually happens if your browser's ad-blocker is blocking Supabase requests. Please try disabling your ad-blocker for this site and refresh!";
      }
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError("");
      await loginWithGoogle();
    } catch (err) {
      console.error("Google signup error:", err);
      setError(err.message || "Google Sign-up failed.");
    }
  };

  // Render Success State
  if (successMsg) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-6"
        style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}
      >
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-100 dark:opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }}
        />
        <div className="w-full max-w-md bg-white dark:bg-[#1a2e24] border border-[#f0fdf4] dark:border-[#2a4034] rounded-3xl p-8 relative z-10 text-center shadow-lg dark:shadow-slate-950/50">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-50 dark:bg-[#102219] border border-emerald-100 dark:border-emerald-950/30">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-[#0f1f12] dark:text-emerald-400 mb-4 font-syne">Registration Successful</h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8">{successMsg}</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-6 py-8 sm:py-12" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%)' }}>
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(34,160,69,0.12) 0%, transparent 70%)' }} />

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 transition-all group"
        style={{ color: '#374151', fontWeight: 500, fontSize: '14px' }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#16a34a'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
      >
        <div className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-green-200 dark:group-hover:border-emerald-500/30 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="w-full max-w-md relative z-10">

        {/* Logo Header */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#16a34a]/10 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <BrainCircuit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">HelpDesk.ai</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)', border: '1px solid #f0fdf4' }}>
          <div className="text-center" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0f1f12', letterSpacing: '-0.02em', marginBottom: '8px' }}>Create Account</h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Start automating your IT support today</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-4">
              <div className="rounded-full p-1 mt-0.5 bg-red-100 dark:bg-red-900/50">
                <ArrowRight className="w-3 h-3 text-red-600 dark:text-red-400 rotate-45" />
              </div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 sm:space-y-5">
            {/* Company Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Company</label>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full bg-slate-50 dark:bg-[#102219] border rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all cursor-pointer flex items-center justify-between focus:ring-4 focus:ring-emerald-500/5 ${isDropdownOpen ? 'border-emerald-600 shadow-sm' : 'border-slate-200 dark:border-[#2a4034]'}`}
              >
                {selectedCompany ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-[#1a2e24]">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="font-semibold">{selectedCompany.name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400 dark:text-slate-600 font-medium">Select your company...</span>
                )}
                <ChevronDown className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a2e24] border border-slate-200 dark:border-[#2a4034] rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-100">
                  <div className="p-2 flex items-center gap-2 border-b border-slate-100 dark:border-[#2a4034] bg-slate-50 dark:bg-[#102219]">
                    <Search className="w-4 h-4 ml-2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search companies..."
                      className="w-full bg-transparent border-none outline-none text-sm py-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                      value={companySearch}
                      onChange={(e) => setCompanySearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                    {isLoadingCompanies ? (
                      <div className="py-6 flex flex-col items-center justify-center gap-2 opacity-50">
                        <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin border-emerald-600"></div>
                        <span className="text-xs font-bold text-slate-400">Loading...</span>
                      </div>
                    ) : filteredCompanies.length > 0 ? (
                      filteredCompanies.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => { setSelectedCompany(c); setIsDropdownOpen(false); setCompanySearch(""); }}
                          className="px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-3 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-200 font-semibold text-sm"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 dark:border-[#2a4034] bg-white dark:bg-[#102219]">
                            <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          </div>
                          <span>{c.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center rounded-lg mx-1 my-1 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#102219] border border-dashed border-slate-200 dark:border-[#2a4034] text-xs">
                        No companies found.<br />
                        <span className="text-[10px] text-slate-400 mt-1 block">Ask your IT Admin to register your company first.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-400"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setError(""); }}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                placeholder="Enter your system email"
                className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-400"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                required
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars"
                    className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm pr-11 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <p aria-live="polite" className={`mt-2 text-[10px] font-bold tracking-tight uppercase ${passwordWarning ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {passwordWarning || "Password Secure"}
                  </p>
                )}
              </div>
              <div className="relative">
                <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confirm</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat"
                    className="w-full bg-slate-50 dark:bg-[#102219] border border-slate-200 dark:border-[#2a4034] rounded-xl px-4 py-3 text-sm pr-11 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-400"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPasswordWarning && (
                  <p aria-live="polite" className="mt-2 text-[10px] font-bold tracking-tight uppercase text-red-500">
                    Mismatch
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl py-4 font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSubmitting ? "Creating Profile..." : "Submit Registration"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-[#2a4034]"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-[#2a4034]"></div>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#1a2e24] border border-slate-200 dark:border-[#2a4034] hover:bg-slate-50 dark:hover:bg-[#223c2f] text-slate-700 dark:text-slate-200 rounded-xl py-3.5 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.14-.14 3.01l3.07 2.38c1.8-1.66 2.84-4.11 2.84-7.24z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.07-2.38c-.9.6-2.03.96-3.23.96-2.48 0-4.58-1.67-5.33-3.92L1.13 19.38C3.11 23.3 7.18 24 12 24z"/>
                <path fill="#FBBC05" d="M6.67 15.75c-.2-.6-.31-1.25-.31-1.92s.11-1.32.31-1.92L1.13 7.99C.41 9.43 0 11.08 0 12.8s.41 3.37 1.13 4.81l5.54-3.86z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.18 0 3.11 3.7 1.13 7.99l5.54 3.86c.75-2.25 2.85-3.92 5.33-3.92z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
