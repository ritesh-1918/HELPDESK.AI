import React, { useEffect, useRef, useState } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { Bot } from 'lucide-react';
import useToastStore from '../../store/toastStore';
import { Card } from "../../components/ui/card";
import AIProcessingSteps from "../components/AIProcessingSteps";
import useTicketStore from "../../store/ticketStore";
import useAdminStore from '../../admin/store/adminStore';
import useAuthStore from '../../store/authStore';
import { supabase } from '../../lib/supabaseClient';
import { API_CONFIG } from '../../config';
import { analyzeTicketWithAI } from '../../services/aiAssistant';

const steps = [
    "Reading your message",
    "Extracting technical entities",
    "Detecting category and priority",
    "Checking duplicate issues",
    "Finding possible solutions"
];

// Allow tuning via env; 15 s accommodates ML cold-starts and OCR processing.
const STREAM_TIMEOUT_MS = Number(import.meta.env.VITE_AI_STREAM_TIMEOUT_MS) || 15000;

const AIProcessing = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { text, image_text, image_base64, template_id, template_used, user_modified, ticket_title, original_text, original_language } = location.state || {};
    const setAITicket = useTicketStore((state) => state.setAITicket);
    const { settings } = useAdminStore();
    const { user, profile } = useAuthStore();
    const { showToast } = useToastStore();
    const hasCalledAPI = useRef(false);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        if (!text) {
            navigate('/create-ticket');
            return;
        }

        if (hasCalledAPI.current) return;
        hasCalledAPI.current = true;

        const analyzeTicket = async () => {
            try {

                // ── Upload Image if present ──
                let uploadedImageUrl = null;

                if (image_base64) {
                    try {
                        const base64Data = image_base64.split(',')[1] || image_base64;
                        const contentType =
                            image_base64.match(/data:(.*?);/)?.[1] || 'image/jpeg';

                        const fileExt = contentType.split('/')[1] || 'jpeg';

                        const byteCharacters = atob(base64Data);
                        const byteNumbers = new Array(byteCharacters.length);

                        for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }

                        const byteArray = new Uint8Array(byteNumbers);

                        const blob = new Blob([byteArray], { type: contentType });

                        const fileName =
                            `${user?.id || 'anon'}/${Date.now()}-${Math.random()
                                .toString(36)
                                .substring(7)}.${fileExt}`;

                        const { error: uploadError } = await supabase.storage
                            .from('ticket-attachments')
                            .upload(fileName, blob, { contentType, upsert: true });

                        if (!uploadError) {
                            const { data: publicUrlData } = supabase.storage
                                .from('ticket-attachments')
                                .getPublicUrl(fileName);

                            uploadedImageUrl = publicUrlData?.publicUrl;
                        }
                    } catch (err) {
                        console.error("[AIProcessing] Image upload failed:", err);
                    }
                }

                const payload = {
                    text: text,
                    image_text: image_text || "",
                    image_base64: image_base64 || "",
                    user_id: user?.id,
                    company:
                        profile?.company ||
                        user?.user_metadata?.company ||
                        "System",
                    company_id: profile?.company_id || null,
                    image_url: uploadedImageUrl,
                    confidence_threshold: settings.aiConfidenceThreshold,
                    duplicate_sensitivity: settings.duplicateSensitivity,
                    template_id: template_id || null,
                    template_used: template_used || false,
                    user_modified: user_modified || false,
                    ticket_title: ticket_title || null,
                };

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

                const response = await fetch(
                    `${API_CONFIG.BACKEND_URL}/ai/analyze_stream`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    }
                );
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`Backend streaming failed: HTTP ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");

                let done = false;
                let finalTicket = null;
                let buffer = "";

                while (!done) {
                    const { value, done: readerDone } = await reader.read();
                    done = readerDone;

                    if (value) {
                        buffer += decoder.decode(value, { stream: true });
                        const events = buffer.split('\n\n');
                        buffer = events.pop() || "";

                        for (const event of events) {
                            const lines = event.split('\n');

                            for (const line of lines) {
                                if (!line.startsWith('data: ')) continue;

                                try {
                                    const data = JSON.parse(line.substring(6));

                                    if (data.step === 'done') {
                                        setActiveStep(steps.length);
                                        finalTicket = data.result;
                                    } else {
                                        const stepIndex = steps.indexOf(data.step);
                                        if (stepIndex !== -1) setActiveStep(stepIndex);
                                    }
                                } catch (e) {
                                    console.error("[AIProcessing] Stream parse error:", e, line);
                                }
                            }
                        }
                    }
                }

                // Flush any incomplete trailing buffer
                if (buffer.trim()) {
                    for (const line of buffer.split('\n')) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const data = JSON.parse(line.substring(6));
                            if (data.step === 'done') finalTicket = data.result;
                        } catch (e) {
                            console.error("[AIProcessing] Final buffer parse error:", e, line);
                        }
                    }
                }

                if (!finalTicket) {
                    throw new Error("BACKEND_STARTUP");
                }

                // Enrich backend result with frontend multi-provider AI summary/classification
                try {
                    const aiResult = await analyzeTicketWithAI(text, image_text, image_base64);
                    finalTicket.summary = aiResult.summary || finalTicket.summary;
                    if (aiResult.image_description) {
                        finalTicket.image_description = aiResult.image_description;
                    }

                    // Frontend LLM is more reliable for regional languages than the local ML model.
                    if (aiResult.category && (finalTicket.confidence < 0.6 || finalTicket.category === 'Unknown' || finalTicket.category === 'Access')) {
                        finalTicket.category = aiResult.category;
                        finalTicket.subcategory = aiResult.subcategory || finalTicket.subcategory;
                        finalTicket.priority = aiResult.priority || finalTicket.priority;
                        finalTicket.assigned_team = aiResult.assigned_team || finalTicket.assigned_team;
                        finalTicket.confidence = aiResult.confidence || 0.95;
                    }
                } catch (aiErr) {
                    console.warn("[AIProcessing] Frontend summary generation failed:", aiErr);
                }

                const aiTicketObject = {
                    ...finalTicket,
                    status: 'analyzing',
                    originalIssue: original_text || text,
                    originalLanguage: original_language || 'en',
                    capturedFileBase64: image_base64,
                    ocrText: image_text,
                    image_url: uploadedImageUrl || finalTicket?.image_url || null
                };

                setAITicket(aiTicketObject);
                setTimeout(() => navigate('/ai-understanding'), 1000);

            } catch (error) {
                // Classify the error so reasoning and confidence reflect reality.
                const isTimeout = error?.name === 'AbortError';
                const isBackendStartup = error?.message === 'BACKEND_STARTUP';
                const isNetworkError = error instanceof TypeError;

                let errorType = 'unknown';
                if (isTimeout) errorType = 'timeout';
                else if (isBackendStartup) errorType = 'backend_startup';
                else if (isNetworkError) errorType = 'network';

                console.warn(`[AIProcessing] Backend unreachable (${errorType}). Using AI fallback.`);

                let summary =
                    (text.charAt(0).toUpperCase() + text.slice(1))
                        .substring(0, 100) + (text.length > 100 ? '…' : '');
                let image_description = "";
                let fallbackCategory = "General";
                let fallbackSub = "General Support";
                let fallbackPriority = "Medium";
                let fallbackTeam = "General Support";

                try {
                    const aiResult = await analyzeTicketWithAI(text, image_text, image_base64);
                    summary = aiResult.summary || summary;
                    image_description = aiResult.image_description || "";

                    if (aiResult.category) {
                        fallbackCategory = aiResult.category;
                        fallbackSub = aiResult.subcategory || fallbackSub;
                        fallbackPriority = aiResult.priority || fallbackPriority;
                        fallbackTeam = aiResult.assigned_team || fallbackTeam;
                    }
                } catch (aiErr) {
                    console.warn("[AIProcessing] Fallback AI summary failed:", aiErr);
                }

                const fallbackTicket = {
                    summary,
                    status: 'analyzing',
                    category: fallbackCategory,
                    subcategory: fallbackSub,
                    priority: fallbackPriority,
                    auto_resolve: false,
                    assigned_team: fallbackTeam,
                    entities: [],
                    duplicate_ticket: { is_duplicate: false, similarity: 0 },
                    // Low confidence: ML backend was unreachable, classification is AI-only.
                    confidence: 0.3,
                    needs_review: true,
                    reasoning: `Analyzed via AI fallback — backend ML model unreachable (${errorType}).`,
                    image_description,
                    ocr_text: image_text || "",
                    highlights: [],
                    originalIssue: original_text || text,
                    originalLanguage: original_language || 'en',
                    capturedFileBase64: image_base64,
                    ocrText: image_text,
                    image_url: null
                };

                setAITicket(fallbackTicket);
                setTimeout(() => navigate('/ai-understanding'), 500);
            }
        };

        analyzeTicket();

    }, [text, image_text, image_base64, navigate, setAITicket, settings, user, profile]);

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#f6f8f7] min-h-screen relative overflow-hidden">

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <Card className="w-full max-w-md bg-white border border-gray-100 shadow-xl shadow-gray-200/40 rounded-3xl overflow-hidden relative z-10">
                <div className="p-10 flex flex-col items-center">

                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 shadow-sm relative">
                        <Bot className="w-8 h-8 text-emerald-600 relative z-10" />
                        <div
                            className="absolute inset-0 border-2 border-emerald-500/20 rounded-2xl animate-ping"
                            style={{ animationDuration: '2s' }}
                        ></div>
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 tracking-tight text-center mb-2">
                        Analyzing your issue
                    </h1>

                    <p className="text-sm font-medium text-gray-500 text-center px-4 mb-10">
                        Our AI is understanding your request and checking for solutions.
                    </p>

                    <AIProcessingSteps
                        steps={steps}
                        activeStep={activeStep}
                    />

                </div>
            </Card>
        </div>
    );
};

export default AIProcessing;
