import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { BrainCircuit, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase handles the recovery token via hash automatically
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
        <div className="min-h-screen flex items-center justify-center font-sans bg-emerald-900 relative overflow-hidden p-6 py-12">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo Header */}
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition hover:bg-white/20">
                        <BrainCircuit className="w-5 h-5 text-emerald-300" />
                        <span className="font-bold text-lg text-white">HelpDesk.ai</span>
                    </Link>
                </div>

                <div className="bg-white shadow-2xl shadow-emerald-900/50 rounded-3xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                        <p className="text-gray-500 mt-1">Choose a strong, secure password.</p>
                    </div>

                    {message ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <p className="text-gray-900 font-bold text-lg mb-2">{message}</p>
                            <p className="text-gray-500 text-sm">Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-start gap-3">
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 8 characters"
                                            className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-gray-800 placeholder:text-gray-400 font-medium bg-white"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Repeat password"
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-gray-800 placeholder:text-gray-400 font-medium bg-white"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-900 text-white rounded-xl py-3.5 font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98] disabled:opacity-70 disabled:grayscale flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
