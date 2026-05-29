import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity, CheckCircle2, ShieldCheck, User,
    Clock, ArrowRight, Loader2, FileText, Zap
} from 'lucide-react';
import useTicketStore from "../../store/ticketStore";
import useAuthStore from "../../store/authStore";
import { Card, CardContent } from "../../components/ui/card";
import TicketTimeline from "../components/TicketTimeline";
import axios from 'axios';
import { API_CONFIG } from '../../config';

const TicketTracking = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { aiTicket, addTicket } = useTicketStore();
    const { user, profile } = useAuthStore();
    const [isCreating, setIsCreating] = useState(true);
    const [error, setError] = useState(null);
    const [createdTicket, setCreatedTicket] = useState(null);
    const hasCreated = useRef(false);
    const resolutionSteps = useMemo(() => location.state?.resolutionSteps || [], [location.state?.resolutionSteps]);

    const getSlaBreachAt = (priority = 'Medium') => {
        const hoursMap = { Critical: 2, High: 8, Medium: 24, Low: 72 };
        const slaHours = hoursMap[priority] || 24;
        return new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
    };

    useEffect(() => {
        if (!aiTicket) {
            navigate('/create-ticket');
            return;
        }

        const finalizeTracking = async () => {
            if (hasCreated.current) return;
            hasCreated.current = true;

            try {
                // Determine the correct status
                const isAutoResolved = aiTicket.auto_resolve || false;
                const status = isAutoResolved ? 'auto_resolved' : 'pending_human';

                // Map AI Analysis into the TicketSaveRequest format
                const savePayload = {
                    user_id: user?.id,
                    subject: aiTicket.summary,
                    description: aiTicket.originalIssue || aiTicket.summary,
                    detected_language: aiTicket.source_language || 'en',
                    original_body: aiTicket.original_text || null,
                    category: aiTicket.category,
                    subcategory: aiTicket.subcategory,
                    priority: aiTicket.priority,
                    assigned_team: aiTicket.assigned_team,
                    status: status,
                    auto_resolve: isAutoResolved,
                    is_duplicate: aiTicket.duplicate_ticket?.is_duplicate || false,
                    is_potential_duplicate: aiTicket.is_potential_duplicate || aiTicket.duplicate_ticket?.is_potential_duplicate || false,
                    parent_ticket_id: aiTicket.parent_ticket_id || aiTicket.duplicate_ticket?.parent_ticket_id || aiTicket.duplicate_ticket?.duplicate_ticket_id || null,
                    confidence: aiTicket.confidence,
                    image_url: aiTicket.image_url || null,
                    company: profile?.company || null,
                    company_id: profile?.company_id || null,
                    sla_breach_at: aiTicket.sla_breach_at || getSlaBreachAt(aiTicket.priority),
                    metadata: {
                        confidence: aiTicket.confidence,
                        entities: aiTicket.entities,
                        decision_factors: aiTicket.decision_factors,
                        ocr_text: aiTicket.ocr_text,
                        image_description: aiTicket.image_description
                    },
                    entities: aiTicket.entities,
                    solution_steps: resolutionSteps,
                    ocr_text: aiTicket.ocr_text || "",
                    needs_review: aiTicket.needs_review,
                    routing_confidence: aiTicket.confidence
                };

                const res = await axios.post(`${API_CONFIG.BACKEND_URL}/tickets/save`, savePayload);

                if (res.data?.ticket_id) {
                    const newTicket = { ...aiTicket, id: res.data.ticket_id, ticket_id: res.data.ticket_id, status };
                    addTicket(newTicket);
                    setCreatedTicket(newTicket);
                    setIsCreating(false);

                    // Redirect to the detail page after a short confirmation pause
                    setTimeout(() => {
                        navigate(`/ticket/${res.data.ticket_id}`);
                    }, 2500);
                } else {
                    throw new Error("Failed to retrieve ID from backend.");
                }
            } catch (err) {
                console.error("Tracking Error:", err);
                setError(err.message || "Failed to create ticket.");
                setIsCreating(false);
            }
        };

        finalizeTracking();
    }, [aiTicket, addTicket, navigate, user, profile?.company, profile?.company_id, resolutionSteps]);

    if (!aiTicket) return null;

    return (
        <div className="min-h-screen bg-[#f6f8f7] flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-[500px] text-center space-y-8">

                {/* Animation Section */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-50 flex items-center justify-center mx-auto">
                        {isCreating ? (
                            <Activity className="w-10 h-10 text-emerald-600 animate-spin" />
                        ) : error ? (
                            <Clock className="w-10 h-10 text-red-500" />
                        ) : (
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {isCreating ? "Escalating to Specialists" : error ? "Something went wrong" : "Successfully Escalated"}
                    </h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        {isCreating
                            ? `We're assigning your ${aiTicket.category || 'support'} request to the right team.`
                            : error
                                ? error
                                : "Your ticket has been created and assigned. Redirecting to tracking..."
                        }
                    </p>
                </div>

                {/* Dynamic Status Steps — shows real AI data */}
                <Card className="rounded-2xl border border-gray-100 shadow-sm bg-white overflow-hidden text-left">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center gap-4 text-emerald-600 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>AI Analysis Complete</span>
                            <span className="ml-auto text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                                {aiTicket.category || 'General'}
                            </span>
                        </div>
                        <div className={`flex items-center gap-4 text-sm font-bold ${isCreating ? 'text-gray-400' : error ? 'text-red-500' : 'text-emerald-600'}`}>
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin text-emerald-500" /> : error ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>{error ? 'Failed to create ticket' : 'Creating Support Ticket'}</span>
                        </div>
                        <div className={`flex items-center gap-4 text-sm font-bold ${createdTicket ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {createdTicket ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            <span>
                                {createdTicket
                                    ? `Assigned → ${createdTicket.assigned_team}`
                                    : 'Agent Assignment Pending'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Dynamic Ticket Timeline — passes the REAL ticket with Supabase data */}
                {createdTicket && <TicketTimeline ticket={createdTicket} />}

            </div>
        </div>
    );
};

export default TicketTracking;
