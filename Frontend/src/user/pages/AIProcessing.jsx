import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Bot } from 'lucide-react';
import useToastStore from '../../store/toastStore';
import { Card } from "../../components/ui/card";
import AIProcessingSteps from "../components/AIProcessingSteps";
import useTicketStore from "../../store/ticketStore";
import useAdminStore from '../../admin/store/adminStore';
import { API_CONFIG } from '../../config';

const steps = [
    "Reading your message",
    "Extracting technical entities",
    "Detecting category and priority",
    "Checking duplicate issues",
    "Finding possible solutions"
];

const AIProcessing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { text, image_text, image_base64 } = location.state || {};
    const setAITicket = useTicketStore((state) => state.setAITicket);
    const { showToast } = useToastStore();
    const hasCalledAPI = useRef(false);

    useEffect(() => {
        if (!text) {
            console.warn("[AIProcessing] No ticket text found. Redirecting to /create-ticket");
            navigate('/create-ticket');
            return;
        }

        if (hasCalledAPI.current) return;
        hasCalledAPI.current = true;

        const analyzeTicket = async () => {
            console.log("[AIProcessing] Starting analysis for:", text);
            try {
                // === Single call to backend — handles ML classification + Gemini summary ===
                // Classification, NER, priority, team assignment, duplicate detection → local ML model
                // Summary generation → backend Gemini service (no redundant frontend API call)
                const { settings } = useAdminStore.getState();

                const response = await axios.post(`${API_CONFIG.BACKEND_URL}/ai/analyze_ticket`, {
                    text: text,
                    image_text: image_text || "",
                    image_base64: image_base64 || "",
                    confidence_threshold: settings.aiConfidenceThreshold,
                    duplicate_sensitivity: settings.duplicateSensitivity
                });

                console.log("[AIProcessing] Backend Success:", response.data);

                // === Validate response format (Hugging Face sometimes returns HTML if Space is starting) ===
                if (typeof response.data !== 'object' || response.data === null || (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE'))) {
                    console.warn("[AIProcessing] Backend returned non-JSON (likely HF startup page). Falling back.");
                    throw new Error("BACKEND_STARTUP");
                }

                const analysis = response.data;

                // === Build the ticket object — trust backend for everything ===
                const aiTicketObject = {
                    ...analysis,
                    status: 'analyzing',
                    originalIssue: text,
                    capturedFileBase64: image_base64,
                    ocrText: image_text
                };

                setAITicket(aiTicketObject);

                // Slight delay to let animation finish
                setTimeout(() => navigate('/ai-understanding'), 1000);

            } catch (error) {
                console.error("[AIProcessing] Analysis Failed:", error);

                // Graceful fallback — build a basic ticket from the text directly
                // so the user can still proceed even if backend is down or starting up
                if (error.code === 'ERR_NETWORK' || error.message === 'BACKEND_STARTUP' || error.message?.includes('Network Error')) {
                    console.warn("[AIProcessing] Backend unreachable or preparing. Using local fallback.");

                    const summary = (text.charAt(0).toUpperCase() + text.slice(1)).substring(0, 100)
                        + (text.length > 100 ? '…' : '');

                    const fallbackTicket = {
                        summary,
                        status: 'analyzing',
                        category: "General",
                        subcategory: "General Support",
                        priority: "Medium",
                        auto_resolve: false,
                        assigned_team: "General Support",
                        entities: [],
                        duplicate_ticket: { is_duplicate: false, similarity: 0 },
                        confidence: 0.5,
                        needs_review: true,
                        reasoning: "Analyzed locally — backend was unreachable.",
                        image_description: "",
                        ocr_text: image_text || "",
                        highlights: [],
                        originalIssue: text,
                        capturedFileBase64: image_base64,
                        ocrText: image_text
                    };

                    setAITicket(fallbackTicket);
                    setTimeout(() => navigate('/ai-understanding'), 500);
                } else {
                    showToast("AI Analysis sequence failed. Check network protocols.", "error");
                    navigate('/create-ticket');
                }
            }
        };

        analyzeTicket();
    }, [text, image_text, image_base64, navigate, setAITicket]);

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#f6f8f7] min-h-screen relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <Card className="w-full max-w-md bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden relative z-10">
                <div className="p-10 flex flex-col items-center">

                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 shadow-sm relative">
                        <Bot className="w-8 h-8 text-emerald-600 relative z-10" />
                        <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-2xl animate-ping" style={{ animationDuration: '2s' }}></div>
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 tracking-tight text-center mb-2">
                        Analyzing your issue
                    </h1>
                    <p className="text-sm font-medium text-gray-500 text-center px-4 mb-10">
                        Our AI is understanding your request and checking for solutions.
                    </p>

                    <AIProcessingSteps steps={steps} />
                </div>
            </Card>
        </div>
    );
};

export default AIProcessing;
