<<<<<<< HEAD
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { Heart, Target, Award, Shield, Cpu, Activity, HelpCircle, ChevronLeft } from 'lucide-react';
import { Card } from '../components/ui/card';
import Footer from "../components/landing/Footer";
import Header from "../components/landing/Header";

// --- COUNT-UP COUNTER SUB-COMPONENT ---
function CounterNumber({ target, prefix = '', suffix = '', duration = 1500, isWord = false }) {
    const [display, setDisplay] = useState(isWord ? target : '0');
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView || isWord) return;

        let startTimestamp = null;
        const targetNum = parseFloat(target);

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Cubic Ease Out

            setDisplay(String(Math.round(eased * targetNum)));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, [isInView, target, duration, isWord]);

    return (
        <span ref={ref} className="tabular-nums">
            {prefix}{display}{suffix}
        </span>
    );
}

// --- ANIMATION VARIANTS CONFIGURATION ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 60, damping: 15 }
    }
};
=======
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  FolderOpen,
  Zap,
  Layers,
  ShieldCheck,
  Database,
  Server,
  Laptop,
  Github,
  Linkedin,
  ExternalLink,
  Users,
  BookOpen,
  HelpCircle,
  Code,
  Clock,
  Bot,
  Activity,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  Globe,
  Shuffle,
  CheckCircle2,
  Terminal,
  AlertCircle
} from "lucide-react";
>>>>>>> upstream/gssoc

// Framer Motion Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

<<<<<<< HEAD
    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col transition-colors duration-300 w-full overflow-x-hidden">
            <Header />

            {/* Main Wrapper with Framer Motion Orchestration */}
            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-20 sm:space-y-32 relative z-10"
            >
                {/* Back to Home Button */}
                <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
                    <Link to="/" className="flex items-center gap-2 font-bold text-base text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group">
                        <div className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:border-emerald-500/30 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </div>
                        <span>Back to Home</span>
                    </Link>
                </motion.div>

                {/* Hero / Identity Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <motion.div variants={itemVariants} className="space-y-6 lg:col-span-7 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-700 dark:text-emerald-400 text-sm font-extrabold uppercase tracking-wider">
                            <Heart size={16} className="animate-pulse" /> Our Mission
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] font-syne">
                            Pioneering Intelligent Triage
                        </h2>
                        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                            At HelpDesk.ai, we strive to build local machine learning workflows that eliminate manual ticket tagging, priority guessing, and routing bottlenecks. By moving infrastructure closer to where data resides, we deliver hyper-secure, deterministic automation scales.
                        </p>
                    </motion.div>

                    {/* Visual Performance Metrics Grid with Counter Hooks */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:col-span-5 w-full">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-center shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300">
                            <span className="block text-2xl sm:text-4xl xl:text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                                &lt; <CounterNumber target="1.2" suffix="s" />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-2">Classification Latency</span>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-center shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300">
                            <span className="block text-2xl sm:text-4xl xl:text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tight font-mono">
                                <CounterNumber target="99" suffix=".4%" />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-2">Triage Accuracy</span>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-center shadow-sm hover:shadow-md hover:border-purple-500/30 transition-all duration-300">
                            <span className="block text-2xl sm:text-4xl xl:text-5xl font-black text-purple-600 dark:text-purple-400 tracking-tight font-mono">
                                <CounterNumber target="100" suffix="%" />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-2">Data Sovereignty</span>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-center shadow-sm hover:shadow-md hover:border-amber-500/30 transition-all duration-300">
                            <span className="block text-2xl sm:text-4xl xl:text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
                                <CounterNumber target="Zero" isWord={true} />
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-2">Manual Queues</span>
                        </div>
                    </motion.div>
                </section>

                {/* Core Architectural Foundations */}
                <motion.section variants={itemVariants} className="space-y-8 sm:space-y-12 py-6 rounded-3xl">
                    <div className="text-center lg:text-left space-y-3 px-2">
                        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-syne">
                            Architectural Foundations
                        </h3>
                        <p className="text-base text-slate-500 dark:text-slate-400 font-semibold">
                            High-performance technical principles underlying the enterprise engine.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center items-stretch justify-items-center max-w-7xl mx-auto">
                        {/* Card 1: Self-Healing Backups */}
                        <Card className="p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center text-center shadow-sm dark:shadow-none hover:-translate-y-1 transition-all duration-300 group relative border-b-4 border-b-transparent dark:hover:border-b-emerald-400 w-full max-w-sm">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mb-6 mx-auto border border-emerald-500/20 group-hover:scale-105 transition-transform">
                                <Target size={24} />
                            </div>
                            <div className="space-y-3 flex-grow w-full flex flex-col items-center justify-center">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">Self-Healing Backups</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    By backing up offline sentence embeddings with fast Gemini failover pipelines, we achieve 100% platform availability under tight network margins.
                                </p>
                            </div>
                        </Card>

                        {/* Card 2: Data Sovereignty */}
                        <Card className="p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center text-center shadow-sm dark:shadow-none hover:-translate-y-1 transition-all duration-300 group border-b-4 border-b-transparent dark:hover:border-b-blue-400 w-full max-w-sm">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mb-6 mx-auto border border-blue-500/20 group-hover:scale-105 transition-transform">
                                <Award size={24} />
                            </div>
                            <div className="space-y-3 flex-grow w-full flex flex-col items-center justify-center">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">Data Sovereignty</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    All ticket summaries, OCR attachments, and database timelines remain securely locked under regional cloud networks.
                                </p>
                            </div>
                        </Card>

                        {/* Card 3: Hybrid Inference */}
                        <Card className="p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center text-center shadow-sm dark:shadow-none hover:-translate-y-1 transition-all duration-300 group border-b-4 border-b-transparent dark:hover:border-b-purple-400 w-full max-w-sm">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mb-6 mx-auto border border-purple-500/20 group-hover:scale-105 transition-transform">
                                <Cpu size={24} />
                            </div>
                            <div className="space-y-3 flex-grow w-full flex flex-col items-center justify-center">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">Hybrid Inference</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    Utilizes locally compiled deep learning checkpoints alongside lightweight linguistic rules to ensure immediate offline priority generation.
                                </p>
                            </div>
                        </Card>

                        {/* Card 4: Zero Trust Isolation */}
                        <Card className="p-6 sm:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 flex flex-col items-center text-center shadow-sm dark:shadow-none hover:-translate-y-1 transition-all duration-300 group border-b-4 border-b-transparent dark:hover:border-b-amber-400 w-full max-w-sm">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 mb-6 mx-auto border border-amber-500/20 group-hover:scale-105 transition-transform">
                                <Shield size={24} />
                            </div>
                            <div className="space-y-3 flex-grow w-full flex flex-col items-center justify-center">
                                <h4 className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">Zero Trust Isolation</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    Strict role-based row-level permissions ensure support logs are containerized per organization and protected against external vector leakage.
                                </p>
                            </div>
                        </Card>
                    </div>
                </motion.section>

                {/* The Processing Engine Pipeline */}
                <motion.section variants={itemVariants} className="space-y-10 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-12 shadow-sm transition-colors duration-300">
                    <div className="space-y-3 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                            <Activity size={14} /> Lifecycle Engine
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-syne">How Ingestion Works</h3>
                        <p className="text-base text-slate-500 dark:text-slate-400 font-semibold max-w-xl">Tracing the systemic timeline from unstructured customer intake to automated resolution queues.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative mt-10">
                        <div className="space-y-4 relative z-10 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 md:p-8 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <span className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 font-black text-sm flex items-center justify-center shrink-0 font-mono ring-4 ring-slate-100 dark:ring-slate-800">01</span>
                                <h5 className="font-extrabold text-slate-900 dark:text-white text-lg">Multimodal Ingestion</h5>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium m-0 pl-13">
                                Unstructured issues, email logs, or system images are parsed instantly via cloud-native storage nodes and OCR pipelines.
                            </p>
                        </div>

                        <div className="space-y-4 relative z-10 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 md:p-8 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <span className="w-9 h-9 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shrink-0 font-mono ring-4 ring-emerald-100 dark:ring-emerald-950">02</span>
                                <h5 className="font-extrabold text-slate-900 dark:text-white text-lg">Neural Feature Triage</h5>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium m-0 pl-13">
                                Transformers run semantic classifications on text vectors to append intent targets and auto-assign emergency levels within milliseconds.
                            </p>
                        </div>

                        <div className="space-y-4 relative z-10 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 md:p-8 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <span className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-800 text-white dark:text-emerald-400 font-black text-sm flex items-center justify-center shrink-0 font-mono ring-4 ring-slate-100 dark:ring-slate-800">03</span>
                                <h5 className="font-extrabold text-slate-900 dark:text-white text-lg">Deterministic Routing</h5>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium m-0 pl-13">
                                Resolved routing graphs distribute tasks directly to corresponding technical support tiers without introducing queue friction.
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* Frequently Asked Questions */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="text-center lg:text-left space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                            <HelpCircle size={14} /> FAQ
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-syne">Common Technical Queries</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-all duration-200">
                            <h5 className="font-extrabold text-slate-900 dark:text-white text-lg">How does the platform preserve operation when offline?</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium m-0">
                                The application holds compressed local classifiers. If internet access limits upstream API performance, local fallback paths continue matching metadata fields smoothly.
                            </p>
                        </div>

                        <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-all duration-200">
                            <h5 className="font-extrabold text-slate-900 dark:text-white text-lg">Are external data providers used during ticket inference?</h5>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium m-0">
                                Core categorizations rely on internal model layers. External large models act solely as high-confidence verification overlays when processing ambiguous linguistic data.
                            </p>
                        </div>
                    </div>
                </motion.section>
            </motion.main>

            <Footer />
        </div>
    );
}
=======
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const AboutUs = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTeamFilter, setActiveTeamFilter] = useState("All");

  const capabilities = [
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "Smart Priority Detection",
      desc: "Linguistically parses incoming complaints for urgency and business impact, automatically setting ticket priorities from Low to Critical."
    },
    {
      icon: <FolderOpen className="w-6 h-6 text-emerald-400" />,
      title: "AI Ticket Classification",
      desc: "Uses NLP categorization models to instantly route requests into Network, Hardware, Software, or Access classes, saving manual dispatch hours."
    },
    {
      icon: <Shuffle className="w-6 h-6 text-emerald-400" />,
      title: "Context-Aware Routing",
      desc: "Analyzes issue context and technician workloads to route complex cases directly to the correct specialized IT team with complete logs."
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      title: "Regional Cloud Reliability",
      desc: "Designed specifically for data sovereignty and offline-first resiliency, ensuring enterprise compliance and secure regional cloud hosting."
    }
  ];

  const workflowSteps = [
    {
      label: "Ingestion",
      title: "Incoming User Ticket",
      desc: "A user submits a request via email, chat widget, or portal. The system ingests natural language text.",
      icon: <Database className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-500",
      json: {
        ticket_id: "T-8429",
        source: "Email Parser",
        raw_text: "Hey support, the VPN in downstream Lab 3 keeps disconnecting. Can't access the server! Needs immediate fix.",
        timestamp: new Date().toISOString()
      }
    },
    {
      label: "AI Analysis",
      title: "NLU parsing & OCR extraction",
      desc: "Our models run Named Entity Recognition (NER) and OCR to extract key system parameters, keywords, and text from screenshots.",
      icon: <Bot className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      json: {
        extracted_entities: {
          system: "VPN",
          location: "Lab 3 (Downstream)",
          impact: "Server Access Blocked"
        },
        ocr_text: null,
        confidence_score: 0.985
      }
    },
    {
      label: "Priority Prediction",
      title: "Urgency evaluation",
      desc: "The classifier predicts the category and priority levels by assessing urgency language and historic business impact.",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
      json: {
        predicted_category: "Network",
        predicted_priority: "High",
        urgency_score: 0.92,
        escalation_sla: "2 Hours"
      }
    },
    {
      label: "Team Routing",
      title: "Autonomous queue dispatch",
      desc: "The system matches workloads and skills, and dynamically dispatches the ticket to the optimal engineering team queue.",
      icon: <Shuffle className="w-5 h-5" />,
      color: "from-teal-500 to-emerald-500",
      json: {
        assigned_group: "NetOps Team",
        notified_members: ["Satla P.", "Bandi K."],
        queue_position: 1,
        auto_escalation: true
      }
    },
    {
      label: "Resolution",
      title: "Smart solution delivery",
      desc: "AI scans historical resolutions. If a match is found above the threshold, it sends the solution; otherwise, dispatches with logs.",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "from-emerald-500 to-green-500",
      json: {
        duplicate_detected: false,
        similar_tickets: ["T-4029 (92% match)"],
        suggested_fix: "Remote reboot of the Lab 3 gateway router.",
        status: "Auto-Resolved / Dispatched",
        processing_latency: "1.42s"
      }
    }
  ];

  const teamMembers = [
    // Coordination
    { name: "Duniya Vasa", role: "Team Lead", team: "Coordination", github: "https://github.com/Duniya-24", linkedin: "https://www.linkedin.com/in/duniyavasa/" },
    { name: "Sowjanya N", role: "Member", team: "Coordination", github: "https://github.com/Sowji0118/", linkedin: "https://www.linkedin.com/in/sowjanya-n-962319354" },
    // Frontend
    { name: "Satla Prayukthika", role: "Lead", team: "Frontend", github: "https://github.com/prayukthika03", linkedin: "https://www.linkedin.com/in/satla-prayukthika-328114291/" },
    { name: "Bandi Keerthi Krishna", role: "Member", team: "Frontend", github: "https://github.com/bKeerthi-1205", linkedin: "https://www.linkedin.com/in/bandikeerthikrishna" },
    { name: "Shubha G D", role: "Member", team: "Frontend", github: "https://github.com/gdshubha148", linkedin: "https://www.linkedin.com/in/shubha-g-d-a879003b5" },
    { name: "K.P.V.V.S.S.M.P.Hara", role: "Member", team: "Frontend", github: "https://github.com/phanikotha18-sudo", linkedin: "https://www.linkedin.com/in/phani" },
    // Backend
    { name: "Asmeet Kaur Makkad", role: "Lead", team: "Backend", github: "https://github.com/AsmeetKaurMakkad", linkedin: "https://www.linkedin.com/in/asmeet-kaur-makkad-911bb3304" },
    { name: "Vijayalakshmi S R", role: "Member", team: "Backend", github: "https://github.com/Vijayalakshmi1412", linkedin: "https://www.linkedin.com/in/vijayalakshmi-s-r-6a260228a/" },
    { name: "Dinesh Reddy Vasampelli", role: "Member", team: "Backend", github: "https://github.com/vasampellidineshreddy18-bot", linkedin: "https://www.linkedin.com/in/dineshreddy-vasampelli-b11046296/" },
    { name: "Manya Sahasra", role: "Member", team: "Backend", github: "https://github.com/ManyaSaaha9", linkedin: "https://www.linkedin.com/in/manya2929" },
    // Data
    { name: "Praneetha Baru", role: "Lead", team: "Data", github: "https://github.com/Praneetha7305", linkedin: "https://www.linkedin.com/in/praneetha-baru-0846b0295" },
    { name: "Kavin Sarvesh", role: "Member", team: "Data", github: "https://github.com/Kavinsarvesh2006", linkedin: "https://www.linkedin.com/in/kavin-sarvesh-813437360" },
    { name: "Utukuri Naga Sri Hari Chandana", role: "Member", team: "Data", github: "https://github.com/2300031149-chandana", linkedin: "https://www.linkedin.com/in/naga-sri-hari-chandana-utukuri-541b072a3" },
    { name: "Akash Kumar Paswan", role: "Member", team: "Data", github: "https://github.com/Akashpaswan302", linkedin: "https://www.linkedin.com/in/akash-kumar-paswan-951a13361" },
    { name: "Ganesh Goud Tekmul", role: "Member", team: "Data", github: "https://github.com/ganeshgoud96", linkedin: "https://www.linkedin.com/in/ganesh-goud-a55a8b373/" },
    // Model
    { name: "Asna Abdul Kareem", role: "Lead", team: "Model", github: "https://github.com/Asnaabdul", linkedin: "https://www.linkedin.com/in/asna-abdul-kareem-6774a6292" },
    { name: "Vinitha Giri", role: "Member", team: "Model", github: "https://github.com/vinitha-giri", linkedin: "https://www.linkedin.com/in/vinitha-giri/" },
    { name: "Ippili Raju", role: "Member", team: "Model", github: "https://github.com/raju-ippili", linkedin: "https://www.linkedin.com/in/raju-ippili-419051308/" },
    { name: "Pragati Tiwari", role: "Member", team: "Model", github: "https://github.com/pTIWARI-20", linkedin: "https://www.linkedin.com/in/pragati-tiwari-608b043b5" },
    { name: "Shaik Eshak", role: "Member", team: "Model", github: "https://github.com/Eshakshai", linkedin: "https://www.linkedin.com/in/eshak-s-16738626a/" },
    { name: "Ritesh Bonthalakoti", role: "Member", team: "Model", github: "https://github.com/ritesh-1918", linkedin: "https://www.linkedin.com/in/ritesh1908" }
  ];

  const filteredTeam = activeTeamFilter === "All"
    ? teamMembers
    : teamMembers.filter(m => m.team === activeTeamFilter);

  // Auto-play timer for interactive workflow
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveStep(prev => (prev + 1) % workflowSteps.length);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-[#021510] text-white relative overflow-hidden font-sans bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:32px_32px]">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-teal-400/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-500/5 blur-[130px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* Navigation & Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 flex justify-between items-center"
        >
          <button 
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide transition-all shadow-md shadow-black/30"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/25">GSSoC 2026 Compliant</span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <section className="text-center mb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen AI Ticket Triage</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none">
              About
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                {" "}HELPDESK.AI
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-8">
              A sovereign, reliability-first triage engine engineered to eliminate support ticket bottlenecks. By running fast local ML classifiers and vector similarity searches, we route and self-solve corporate incidents in milliseconds.
            </p>
          </motion.div>
        </section>

        {/* Mission Statement */}
        <section className="mb-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="bg-white/5 border border-white/10 rounded-[32px] p-8 md:p-12 relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">Our Vision</span>
              <h2 className="text-2xl md:text-4xl font-extrabold mb-6 text-white tracking-tight leading-tight">
                "Empowering Enterprises with Sovereign, High-Resiliency Triage Solutions."
              </h2>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                We believe engineering and IT operations should not be held back by ticketing dispatch queues. Our mission is to build a high-performance, offline-resilient automation layer that intercepts complaints, detects system failures, matches historical closures, and empowers human technicians with deep context.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Why HELPDESK.AI? Section */}
        <section className="mb-28">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Enterprise Differentiation</h2>
            <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">What makes HELPDESK.AI the intelligent choice for modern support teams.</p>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {capabilities.map((cap, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ scale: 1.01, borderColor: "rgba(16,185,129,0.3)" }}
                className="bg-white/5 border border-white/10 p-8 rounded-[24px] backdrop-blur-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-all shadow-inner">
                  {cap.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-emerald-300 transition-colors">{cap.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Product Workflow Visualization */}
        <section className="mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Interactive Flow</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">How the Platform Works</h2>
            <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">Click through the pipeline nodes to see ticket transformations in real time.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 md:p-8 backdrop-blur-xl">
            {/* Control Bar */}
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-gray-300">SYSTEM PIPELINE RADAR</span>
              </div>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20 transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause size={12} className="fill-emerald-400" /> Pause Simulation
                  </>
                ) : (
                  <>
                    <Play size={12} className="fill-emerald-400" /> Auto Play
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Step Navigation Tree */}
              <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
                {workflowSteps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveStep(idx);
                      setIsPlaying(false);
                    }}
                    className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-start gap-4 ${
                      activeStep === idx
                        ? "bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5"
                        : "bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-white/5"
                    }`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      activeStep === idx
                        ? "bg-emerald-500 text-black shadow-inner"
                        : "bg-white/5 text-gray-400"
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold transition-colors ${activeStep === idx ? "text-emerald-400" : "text-white"}`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{step.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Simulation Screen */}
              <div className="lg:col-span-7 bg-[#010b08]/80 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[380px]">
                
                {/* Simulator Header */}
                <div className="bg-[#02100c] px-4 py-3 flex items-center justify-between border-b border-white/5 font-mono text-[11px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Terminal size={12} className="text-emerald-400" />
                    <span>triage_simulator_v3.log</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                </div>

                {/* Simulator Body */}
                <div className="p-6 flex-1 flex flex-col justify-between font-mono">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                          {workflowSteps[activeStep].label.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">—</span>
                        <span className="text-xs font-semibold text-gray-300">{workflowSteps[activeStep].title}</span>
                      </div>

                      <p className="text-xs text-gray-400 leading-relaxed font-sans border-l-2 border-emerald-500/30 pl-3">
                        {workflowSteps[activeStep].desc}
                      </p>

                      {/* Code Block Visualizer */}
                      <div className="bg-[#010403] rounded-lg border border-white/5 p-4 overflow-x-auto text-[11px] leading-relaxed text-emerald-300 max-h-[180px]">
                        <pre>{JSON.stringify(workflowSteps[activeStep].json, null, 2)}</pre>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Flow Dot Progress Indicator */}
                  <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pipeline Step {activeStep + 1} of 5</span>
                    <div className="flex gap-1.5">
                      {workflowSteps.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            activeStep === i ? "w-6 bg-emerald-400" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Trust & Reliability Metrics */}
        <section className="mb-28">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Trust Indicators</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Platform Trust & SLA Metrics</h2>
            <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">High-performance guarantees built to sustain enterprise support workloads.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center backdrop-blur-xl transition-all"
            >
              <div className="text-4xl font-extrabold text-emerald-400 mb-2 bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">99.9%</div>
              <h4 className="font-bold text-white text-sm mb-1">Uptime Target SLA</h4>
              <p className="text-xs text-gray-500">Continuous cloud availability backed by high backup redundancy.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center backdrop-blur-xl transition-all"
            >
              <div className="text-4xl font-extrabold text-emerald-400 mb-2 bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">&lt; 2s</div>
              <h4 className="font-bold text-white text-sm mb-1">Triage Latency</h4>
              <p className="text-xs text-gray-500">NLU classification and duplicate detection process instantly.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center backdrop-blur-xl transition-all"
            >
              <div className="text-4xl font-extrabold text-emerald-400 mb-2 bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">100%</div>
              <h4 className="font-bold text-white text-sm mb-1">Data Sovereignty</h4>
              <p className="text-xs text-gray-500">Regional Indian database configurations, complying with data mandates.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center backdrop-blur-xl transition-all"
            >
              <div className="text-4xl font-extrabold text-emerald-400 mb-2 bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">3x</div>
              <h4 className="font-bold text-white text-sm mb-1">Backup Redundancy</h4>
              <p className="text-xs text-gray-500">Multi-tenant isolation backed by replicated storage zones.</p>
            </motion.div>
          </div>
        </section>

        {/* Team / Vision Section */}
        <section className="mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Collaborative Impact</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">The Development Team</h2>
            <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">The open source team that built, trained, and deployed HELPDESK.AI.</p>

            {/* Team Filters */}
            <div className="flex flex-wrap gap-2 justify-center mt-8">
              {["All", "Coordination", "Model", "Backend", "Frontend", "Data"].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveTeamFilter(filter)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    activeTeamFilter === filter
                      ? "bg-emerald-500 text-black border-emerald-500 shadow-md shadow-emerald-500/20"
                      : "bg-white/5 text-gray-300 border-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            layout
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar border border-white/5 bg-[#010906] p-6 rounded-[24px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredTeam.map((member, idx) => (
                <motion.div
                  layout
                  key={member.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -2 }}
                  className="bg-[#021510] border border-white/10 p-5 rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/30 transition-all"
                >
                  {/* Avatar Initials Gradient */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/25 to-teal-400/25 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-300 text-sm tracking-tight shrink-0 shadow-inner group-hover:from-emerald-500/40 group-hover:to-teal-400/40 transition-all">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate leading-snug">{member.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-emerald-400 font-mono tracking-wide bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 uppercase">
                        {member.team}
                      </span>
                      <span className="text-[10px] text-gray-400 truncate">{member.role}</span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors"
                      aria-label={`${member.name} GitHub`}
                    >
                      <Github size={14} />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-emerald-400 transition-colors"
                      aria-label={`${member.name} LinkedIn`}
                    >
                      <Linkedin size={14} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </section>

        {/* Resource Links */}
        <section className="mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Documentation Hub</span>
            <h2 className="text-3xl font-black tracking-tight">Project Resources & Repos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.a
              href="https://github.com/Daksh7785/HELPDESK.AI"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group backdrop-blur-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  <Github size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white">GitHub Repository</h4>
                  <p className="text-xs text-gray-500">Source code & PRs</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </motion.a>

            <motion.a
              href="https://github.com/Daksh7785/HELPDESK.AI#readme"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group backdrop-blur-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white">API Reference</h4>
                  <p className="text-xs text-gray-500">System architecture docs</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </motion.a>

            <motion.a
              href="https://github.com/Daksh7785/HELPDESK.AI/issues"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group backdrop-blur-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Active Roadmap</h4>
                  <p className="text-xs text-gray-500">Issues and enhancements</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </motion.a>
          </div>
        </section>

        {/* CTA Footer Section */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gradient-to-br from-emerald-950/80 via-emerald-900/40 to-emerald-950/80 border border-emerald-500/25 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="max-w-3xl mx-auto relative z-10">
              <Users size={40} className="text-emerald-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">Ready to Automate Your Support Operations?</h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl mx-auto">
                Join early access or contact our sales team to deploy HELPDESK.AI within your enterprise environment.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <button
                  onClick={() => navigate("/admin-signup")}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate("/contact-sales")}
                  className="border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl transition-all active:scale-[0.98]"
                >
                  Contact Sales
                </button>
                <a
                  href="https://github.com/Daksh7785/HELPDESK.AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/20 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-gray-300 hover:text-emerald-400 font-semibold px-6 py-3.5 rounded-xl transition-all flex items-center gap-2 active:scale-[0.98]"
                >
                  <Code size={16} /> Contribute Code
                </a>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

export default AboutUs;
>>>>>>> upstream/gssoc
