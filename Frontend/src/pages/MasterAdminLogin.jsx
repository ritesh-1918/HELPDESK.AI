import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldAlert, Loader2, Lock } from "lucide-react";
import useAuthStore from "../store/authStore";
import { supabase } from "../lib/supabaseClient";

/**
 * MasterAdminLogin — Hidden portal login page.
 * Route: /master-admin-login
 * Not linked from anywhere in the public UI.
 *
 * Intentionally minimal and dark — no HelpDesk.ai branding.
 */
function MasterAdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { login, logout, profile } = useAuthStore();

    // If already logged in as master_admin, skip straight to the dashboard
    useEffect(() => {
        if (profile?.role === "master_admin") {
            navigate("/master-admin/dashboard", { replace: true });
        }
    }, [profile, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            // Step 1: Supabase auth login
            const { user: authUser } = await login(email, password);

            if (!authUser) {
                setError("Authentication failed. Please check your credentials.");
                return;
            }

            // Step 2: Authoritative DB check — bypass the metadata fast-path
            // in authStore.getProfile(), which might default role to 'user'.
            const { data: dbProfile, error: profileError } = await supabase
                .from("profiles")
                .select("role, status")
                .eq("id", authUser.id)
                .single();

            if (profileError || !dbProfile) {
                await logout();
                setError("Access denied. No profile found for this account.");
                return;
            }

            if (dbProfile.role !== "master_admin") {
                await logout();
                setError("Access denied. This portal is restricted.");
                return;
            }

            // Step 3: Valid master admin — proceed
            navigate("/master-admin/dashboard", { replace: true });
        } catch (err) {
            setError(err.message || "Invalid credentials. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 font-sans">
            {/* Ambient glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 overflow-hidden"
            >
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-violet-700/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Lock icon header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/30">
                        <Lock className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-white text-xl font-semibold tracking-tight">
                        Restricted Access
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Authorised personnel only
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/50 backdrop-blur-sm">
                    {/* Error */}
                    {error && (
                        <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="ma-email"
                                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                            >
                                Email
                            </label>
                            <input
                                id="ma-email"
                                type="email"
                                autoComplete="username"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="ma-password"
                                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="ma-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-600 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/15 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all shadow-lg shadow-indigo-900/30 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying…
                                </>
                            ) : (
                                "Authenticate"
                            )}
                        </button>
                    </form>
                </div>

                {/* Discreet footer */}
                <p className="text-center text-slate-700 text-xs mt-6 select-none">
                    Unauthorised access attempts are logged.
                </p>
            </div>
        </div>
    );
}

export default MasterAdminLogin;
