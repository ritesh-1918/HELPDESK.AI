import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { BrainCircuit, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session && !window.location.hash.includes('access_token')) {
                console.warn("ResetPassword visited without active recovery session");
            }
        };
        checkSession();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setMessage("Password successfully updated!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            console.error("Password update error:", err);
            setError(err.message || "Failed to update password. Link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center font-sans relative overflow-hidden p-6 py-12 bg-gradient-to-br from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0] dark:from-[#102219] dark:via-[#142f22] dark:to-[#173a2a] text-slate-900 dark:text-slate-100 transition-colors duration-200">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10 flex flex-col items-center">
                
                {/* Back Button */}
                <Link
                    to="/login"
                    className="lg:absolute lg:top-8 lg:left-8 flex items-center gap-2 mb-8 lg:mb-0 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all group w-fit self-start lg:self-auto"
                >
                    <div className="p-2 rounded-full bg-white dark:bg-[#1a2e24] border border-slate-200 dark:border-[#2a4034] group-hover:border-emerald-500 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold">Back to Login</span>
                </Link>

                {/* Logo Header */}
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-2 bg-white/10 dark:bg-emerald-950/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 dark:border-emerald-900/20 transition hover:bg-white/20">
                        <BrainCircuit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-lg text-slate-900 dark:text-slate-100 font-syne">HelpDesk.ai</span>
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#1a2e24] border border-slate-200 dark:border-[#2a4034] shadow-2xl rounded-3xl p-6 sm:p-8 w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-emerald-400 font-syne">Set New Password</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Choose a strong, secure password.</p>
                    </div>

                    {message ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-2">{message}</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3">
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 8 characters"
                                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 dark:border-[#2a4034] focus:border-emerald-500 dark:focus:border-emerald-500 bg-slate-50/50 dark:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-400 font-medium"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Repeat password"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-[#2a4034] focus:border-emerald-500 dark:focus:border-emerald-500 bg-slate-50/50 dark:bg-[#102219] text-slate-900 dark:text-slate-100 outline-none transition-all focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-400 font-medium"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl py-3.5 font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-70 disabled:grayscale flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                            </button>

                            <div className="text-center pt-6 border-t border-slate-50 dark:border-slate-800 mt-4">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-green-600 dark:hover:text-emerald-400 text-[10px] font-bold uppercase tracking-widest transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Return to Secure Gate
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
