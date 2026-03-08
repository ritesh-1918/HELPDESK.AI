import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Info, Send, AlertTriangle, ScreenShare, ShieldAlert, Camera, Trash2, Crop, MousePointer2, ChevronDown, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '../../lib/supabaseClient';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import { API_CONFIG } from '../../config';

// Reusable Hook for Auto-Diagnostics
function useDiagnostics() {
    const [diagnostics, setDiagnostics] = useState({
        url: '',
        browser: '',
        screen: '',
        consoleErrors: [],
        networkErrors: []
    });

    useEffect(() => {
        // Collect static info
        const browserInfo = navigator.userAgent;
        const screenInfo = `${window.innerWidth}x${window.innerHeight}`;

        setDiagnostics(prev => ({
            ...prev,
            url: window.location.href,
            browser: browserInfo,
            screen: screenInfo
        }));

        // Intercept console.error
        const originalConsoleError = console.error;
        console.error = function (...args) {
            setDiagnostics(prev => ({
                ...prev,
                consoleErrors: [...prev.consoleErrors, args.join(' ')].slice(-10) // keep last 10
            }));
            originalConsoleError.apply(console, args);
        };

        // Global Error Listener
        const handleError = (e) => {
            setDiagnostics(prev => ({
                ...prev,
                consoleErrors: [...prev.consoleErrors, `Uncaught: ${e.message}`].slice(-10)
            }));
        };
        window.addEventListener('error', handleError);

        return () => {
            console.error = originalConsoleError;
            window.removeEventListener('error', handleError);
        };
    }, []);

    // Refresh URL right before opening modal
    const refreshUrl = () => {
        setDiagnostics(prev => ({ ...prev, url: window.location.href }));
    };

    return { diagnostics, refreshUrl };
}

const CustomSelect = ({ label, value, options, onChange, name }) => {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-[#13ec80] transition-all text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#13ec80]/20"
            >
                <span className="truncate">{selectedOption.label}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-[60]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute z-[70] w-full mt-2 py-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange({ target: { name, value: option.value } });
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                                        ${value === option.value
                                            ? 'bg-[#13ec80]/10 text-slate-900 font-semibold'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {option.label}
                                    {value === option.value && (
                                        <Check className="w-4 h-4 text-[#13ec80]" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};


const BugReportWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuthStore();
    const { showToast: addToast } = useToastStore();
    const { diagnostics, refreshUrl } = useDiagnostics();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSubmitTime, setLastSubmitTime] = useState(0);
    const [screenshotData, setScreenshotData] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isSelectingRegion, setIsSelectingRegion] = useState(false);
    const [selectionStart, setSelectionStart] = useState(null);
    const [selectionRect, setSelectionRect] = useState(null);

    const [formData, setFormData] = useState({
        bug_title: '',
        description: '',
        steps_to_reproduce: '',
        expected_result: '',
        actual_result: '',
        severity: 'Medium',
        category: 'Functionality Broken',
        contact_permission: false
    });

    const handleOpen = () => {
        if (!isOpen) {
            refreshUrl();
            setIsOpen(true);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        // Reset specific form fields, but keep severity/category
        setFormData(prev => ({
            ...prev,
            bug_title: '',
            description: '',
            steps_to_reproduce: '',
            expected_result: '',
            actual_result: ''
        }));
        setScreenshotData(null);
    };

    const handleCaptureScreenshot = () => {
        // Step 1: Hide modal and enter selection mode
        setIsOpen(false);
        setSelectionRect(null);
        setSelectionStart(null);

        // Wait for modal animation to clear
        setTimeout(() => {
            setIsSelectingRegion(true);
            addToast("Click and drag over the dashboard to select the bug area.", "info");
        }, 500);
    };

    const handleMouseDown = (e) => {
        if (!isSelectingRegion) return;
        setSelectionStart({ x: e.clientX, y: e.clientY });
        setSelectionRect({ left: e.clientX, top: e.clientY, width: 0, height: 0 });
    };

    const handleMouseMove = (e) => {
        if (!isSelectingRegion || !selectionStart) return;

        const left = Math.min(e.clientX, selectionStart.x);
        const top = Math.min(e.clientY, selectionStart.y);
        const width = Math.abs(e.clientX - selectionStart.x);
        const height = Math.abs(e.clientY - selectionStart.y);

        setSelectionRect({ left, top, width, height });
    };

    const handleMouseUp = async () => {
        if (!isSelectingRegion || !selectionRect || selectionRect.width < 10) {
            setSelectionStart(null);
            setSelectionRect(null);
            return;
        }

        setIsSelectingRegion(false);
        setIsCapturing(true);

        // Snap the region
        try {
            const { left, top, width, height } = selectionRect;

            // html2canvas options for partial capture
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                logging: false,
                x: left + window.scrollX,
                y: top + window.scrollY,
                width: width,
                height: height,
                scale: 2 // High quality
            });

            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            setScreenshotData(base64Image);
            addToast("Region captured successfully!", "success");
        } catch (err) {
            console.error("Capture failed:", err);
            addToast("Failed to capture region.", "error");
        } finally {
            setIsCapturing(false);
            setIsOpen(true);
            setSelectionStart(null);
            setSelectionRect(null);
        }
    };

    const handleCancelSelection = () => {
        setIsSelectingRegion(false);
        setIsOpen(true);
        setSelectionStart(null);
        setSelectionRect(null);
    };

    const handleClearScreenshot = () => {
        setScreenshotData(null);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isSelectingRegion) {
                handleCancelSelection();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSelectingRegion]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 10 second throttle
        const now = Date.now();
        if (now - lastSubmitTime < 10000) {
            addToast("Please wait before submitting another report.", "error");
            return;
        }

        if (!formData.bug_title || !formData.description) {
            addToast("Please fill out the Title and Description fields.", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Call AI Diagnostics
            let probableCause = "Not analyzed";
            try {
                // Using standard fetch assuming backend is on port 8000
                const aiResponse = await fetch(`${API_CONFIG.BACKEND_URL}/ai/analyze_bug`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        bug_title: formData.bug_title,
                        description: formData.description,
                        steps_to_reproduce: formData.steps_to_reproduce,
                        console_errors: diagnostics.consoleErrors
                    })
                });

                if (aiResponse.ok) {
                    const aiData = await aiResponse.json();
                    if (aiData.probable_cause) {
                        probableCause = aiData.probable_cause;
                    }
                }
            } catch (aiErr) {
                console.error("AI Analysis failed silently:", aiErr);
            }

            // 2. Prepare payload
            const payload = {
                user_id: user ? user.id : null,
                bug_title: formData.bug_title,
                description: formData.description,
                steps_to_reproduce: formData.steps_to_reproduce,
                expected_result: formData.expected_result,
                actual_result: formData.actual_result,
                severity: formData.severity,
                category: formData.category,
                contact_permission: formData.contact_permission,
                diagnostic_data: {
                    url: diagnostics.url,
                    browser: diagnostics.browser,
                    screen: diagnostics.screen,
                    console_errors: diagnostics.consoleErrors,
                    network_errors: diagnostics.networkErrors,
                    screenshot_base64: screenshotData, // Attached light-weight jpeg data
                    ai_probable_cause: probableCause,  // Added AI Root Cause Analysis
                    timestamp: new Date().toISOString()
                }
            };

            const { error } = await supabase
                .from('bug_reports')
                .insert([payload]);

            if (error) {
                console.error("Supabase Error:", error);

                // Fallback for demo: if table doesn't exist yet, just mock success.
                if (error.code === '42P01') {
                    // Relation does not exist
                    console.warn("bug_reports table doesn't exist yet. Mocking successful submission for UI preview.");
                    setTimeout(() => {
                        addToast("Diagnostic Report Sent (Mock). Please run the SQL script to persist to DB.", "success");
                        setLastSubmitTime(Date.now());
                        setIsSubmitting(false);
                        handleClose();
                    }, 1000);
                    return;
                }
                throw error;
            }

            addToast("Bug Report Sent. Our diagnostic engine is on it!", "success");
            setLastSubmitTime(Date.now());
            handleClose();

        } catch (error) {
            console.error('Error submitting bug:', error);
            addToast("Failed to submit bug. Please try again later.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpen}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[#13ec80] to-[#0fd472] text-[#111814] px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:shadow-[#13ec80]/20 transition-all border border-[#13ec80]/50 group"
                    >
                        <Bug className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="font-bold text-sm hidden sm:block">Report Bug</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Modal Dialog */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative z-50 my-auto border border-slate-100 flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-3 text-[#13ec80]">
                                    <div className="p-2 bg-[#13ec80]/10 rounded-lg">
                                        <Bug className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">Report a Bug</h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-6 overflow-y-auto customize-scrollbar">

                                {/* Info Box */}
                                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                                    <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold mb-1 text-blue-900">Auto-captured Diagnosis</p>
                                        <p className="text-blue-700/90 leading-relaxed">
                                            Page URL, browser info, console errors, and screen dimensions are automatically attached. You don't need to provide deep technical details—just describe what you experienced.
                                        </p>
                                    </div>
                                </div>

                                <form id="bugReportForm" onSubmit={handleSubmit} className="space-y-5">
                                    {/* Bug Title */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="bug_title">
                                            Bug Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="bug_title"
                                            name="bug_title"
                                            required
                                            value={formData.bug_title}
                                            onChange={handleChange}
                                            placeholder="e.g., Evaluation fails to save after clicking submit"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#13ec80]/20 focus:border-[#13ec80] transition-all text-sm bg-slate-50 focus:bg-white"
                                        />
                                    </div>

                                    {/* What happened? */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="description">
                                            What happened? <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            required
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                            placeholder="Describe the bug in detail..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#13ec80]/20 focus:border-[#13ec80] transition-all text-sm bg-slate-50 focus:bg-white resize-y"
                                        ></textarea>
                                    </div>

                                    {/* Steps to Reproduce */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="steps_to_reproduce">
                                            How can we reproduce this? <span className="text-slate-400 font-normal text-xs ml-1">(Optional)</span>
                                        </label>
                                        <textarea
                                            id="steps_to_reproduce"
                                            name="steps_to_reproduce"
                                            value={formData.steps_to_reproduce}
                                            onChange={handleChange}
                                            rows="2"
                                            placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#13ec80]/20 focus:border-[#13ec80] transition-all text-sm bg-slate-50 focus:bg-white resize-y"
                                        ></textarea>
                                    </div>

                                    {/* Expected vs Actual */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="expected_result">
                                                What should happen?
                                            </label>
                                            <textarea
                                                id="expected_result"
                                                name="expected_result"
                                                value={formData.expected_result}
                                                onChange={handleChange}
                                                rows="2"
                                                placeholder="Expected result..."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#13ec80]/20 focus:border-[#13ec80] transition-all text-sm bg-slate-50 focus:bg-white resize-none"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="actual_result">
                                                What actually happened?
                                            </label>
                                            <textarea
                                                id="actual_result"
                                                name="actual_result"
                                                value={formData.actual_result}
                                                onChange={handleChange}
                                                rows="2"
                                                placeholder="Actual result..."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#13ec80]/20 focus:border-[#13ec80] transition-all text-sm bg-slate-50 focus:bg-white resize-none"
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Dropdowns */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <CustomSelect
                                            label="Severity"
                                            name="severity"
                                            value={formData.severity}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'Low', label: 'Low - Cosmetic/Minor' },
                                                { value: 'Medium', label: 'Medium - Affects functionality' },
                                                { value: 'High', label: 'High - Major blocker' },
                                                { value: 'Critical', label: 'Critical - System crash/Data loss' }
                                            ]}
                                        />
                                        <CustomSelect
                                            label="Bug Category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'UI Issue', label: 'UI Issue' },
                                                { value: 'Functionality Broken', label: 'Functionality Broken' },
                                                { value: 'Performance', label: 'Performance' },
                                                { value: 'Security Issue', label: 'Security Issue' },
                                                { value: 'Other', label: 'Other' }
                                            ]}
                                        />
                                    </div>

                                    {/* Permission */}
                                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors mt-2">
                                        <input
                                            type="checkbox"
                                            name="contact_permission"
                                            checked={formData.contact_permission}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-[#13ec80] rounded border-slate-300 focus:ring-[#13ec80]"
                                        />
                                        <span className="text-sm font-medium text-slate-700">You can contact me for more information about this bug</span>
                                    </label>

                                    {/* Diagnostics Read-Only View */}
                                    <div className="mt-8 border border-slate-100 rounded-xl overflow-hidden text-xs">
                                        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4 text-slate-500" />
                                            <span className="font-semibold text-slate-600 tracking-wide uppercase">Captured Diagnostics</span>
                                        </div>
                                        <div className="p-4 bg-white/50 space-y-2 font-mono text-slate-500">
                                            <div className="flex"><span className="w-24 shrink-0 text-slate-400">Path:</span> <span className="truncate">{diagnostics.url.split(window.location.host)[1] || diagnostics.url}</span></div>
                                            <div className="flex"><span className="w-24 shrink-0 text-slate-400">Browser:</span> <span className="truncate" title={diagnostics.browser}>{diagnostics.browser.split(' ')[0]} {diagnostics.browser.split(' ')[diagnostics.browser.split(' ').length - 1]}</span></div>
                                            <div className="flex"><span className="w-24 shrink-0 text-slate-400">Screen:</span> <span>{diagnostics.screen}</span></div>
                                            <div className="flex"><span className="w-24 shrink-0 text-slate-400">Errors:</span> <span className={diagnostics.consoleErrors.length > 0 ? "text-amber-500 font-bold" : ""}>{diagnostics.consoleErrors.length}</span></div>
                                            <div className="flex"><span className="w-24 shrink-0 text-slate-400">Telemetry:</span> <span className="text-emerald-500">Active</span></div>
                                        </div>
                                    </div>

                                    {/* Action Attachments: Screenshot */}
                                    <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                                    <Camera className="w-4 h-4 text-[#13ec80]" />
                                                    Advanced Attachments
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">Capture your screen to show exactly what's wrong.</p>
                                            </div>
                                            {!screenshotData && (
                                                <button
                                                    type="button"
                                                    onClick={handleCaptureScreenshot}
                                                    disabled={isSubmitting}
                                                    className="px-3 py-1.5 text-xs font-semibold text-[#111814] bg-[#13ec80] hover:bg-[#0fd472] transition-colors rounded-lg flex items-center gap-1.5 border border-[#13ec80]/20 shadow-sm"
                                                >
                                                    <Crop className="w-3.5 h-3.5" />
                                                    Select Region & Snap
                                                </button>
                                            )}
                                        </div>

                                        <AnimatePresence>
                                            {screenshotData && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="relative mt-3 group rounded-lg overflow-hidden border border-slate-200"
                                                >
                                                    <img src={screenshotData} alt="Captured screen" className="w-full h-auto max-h-48 object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={handleClearScreenshot}
                                                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-red-600 transition-colors shadow-lg"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                </form>
                            </div>

                            {/* Footer */}
                            <div className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="bugReportForm"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 text-sm font-bold text-[#111814] bg-[#13ec80] hover:bg-[#0fd472] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all rounded-xl shadow-lg shadow-[#13ec80]/30 flex items-center gap-2"
                                >
                                    {isSubmitting ? 'Sending...' : 'Submit Bug Report'}
                                    {!isSubmitting && <Send className="w-4 h-4" />}
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Region Selection Overlay */}
            <AnimatePresence>
                {isSelectingRegion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        className="fixed inset-0 z-[9999] bg-slate-900/30 cursor-crosshair flex flex-col items-center justify-start pt-12"
                    >
                        <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-2xl border border-white/20 flex items-center gap-2 select-none pointer-events-none">
                            <MousePointer2 className="w-4 h-4 text-[#13ec80]" />
                            <span className="text-sm font-bold text-slate-800">Drag to Select Bug Area</span>
                            <div className="w-px h-4 bg-slate-300 mx-1" />
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-500 shadow-sm">ESC to Cancel</kbd>
                        </div>

                        {selectionRect && (
                            <div
                                className="absolute border-2 border-[#13ec80] bg-[#13ec80]/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.5)]"
                                style={{
                                    left: selectionRect.left,
                                    top: selectionRect.top,
                                    width: selectionRect.width,
                                    height: selectionRect.height
                                }}
                            />
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); handleCancelSelection(); }}
                            className="fixed top-6 right-6 p-2 bg-white rounded-full shadow-lg text-slate-600 hover:text-red-500 transition-colors pointer-events-auto"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global style overrides just for scrollbar inside modal if needed */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .customize-scrollbar::-webkit-scrollbar { width: 6px; }
                .customize-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .customize-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
                .customize-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}} />
        </>
    );
};

export default BugReportWidget;
