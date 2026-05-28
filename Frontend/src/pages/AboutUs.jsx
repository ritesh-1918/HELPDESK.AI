import React from "react";
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
  ExternalLink,
  Users,
  BookOpen,
  HelpCircle,
  Code,
  Sparkles,
  Workflow,
  Shield,
  Cpu,
  Phone,
  Clock,
  MessageSquareText,
  Terminal,
  Network,
  AppWindow
} from "lucide-react";

// Framer Motion Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const springIn = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } }
};

const SectionHeading = ({ eyebrow, title, subtitle }) => {
  return (
    <div className="text-center mb-14">
      {eyebrow ? (
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h2>
      {subtitle ? <p className="text-gray-400 mt-3 max-w-2xl mx-auto leading-relaxed">{subtitle}</p> : null}
    </div>
  );
};

const GlowCard = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden relative ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const Pill = ({ children }) => (
  <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-300/90 text-xs font-semibold rounded-full px-3 py-1.5">
    {children}
  </span>
);

const AboutUs = () => {
  const navigate = useNavigate();

  const aiFeatures = [
    {
      icon: <FolderOpen className="w-6 h-6 text-emerald-400" />,
      title: "Instant Ticket Categorization",
      desc: "Context-aware classification (DistilBERT) categorizes IT requests in milliseconds—so L1 teams stop acting as a routing engine."
    },
    {
      icon: <MessageSquareText className="w-6 h-6 text-emerald-400" />,
      title: "Instant Fix Suggestions",
      desc: "LLM-powered guidance uses integrated knowledge to propose actionable “draft resolutions” during ticket creation."
    },
    {
      icon: <Layers className="w-6 h-6 text-emerald-400" />,
      title: "Duplicate Prevention & Clustering",
      desc: "Vector similarity scan groups semantically identical incidents, preventing agent alert fatigue and reducing repeat work."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "Enterprise Multi-Tenant Isolation",
      desc: "Tiered SaaS isolation with strict organization boundaries—built for production operations and secure workflows."
    },
    {
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
      title: "NER Metadata Harvesting",
      desc: "Named Entity Recognition extracts technical identifiers (hostnames, serial numbers, IPs) to accelerate triage and routing."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
      title: "Generative OCR for Screenshots",
      desc: "Extracts error details from images so users don’t need perfect descriptions—automatically builds structured incident signals."
    }
  ];

  const permissionLayers = [
    {
      label: "Layer 1",
      title: "Master Admin",
      badge: "Global Overseers",
      desc: "Tenant registration, company onboarding, and global health monitoring across the entire SaaS ecosystem.",
      points: [
        "Cross-tenant observability",
        "Provisioning & onboarding workflows",
        "System health & audit trails"
      ],
      icon: <Shield className="w-5 h-5 text-emerald-300" />
    },
    {
      label: "Layer 2",
      title: "Company Admin",
      badge: "IT Management",
      desc: "Organization-level control to manage users, policies, and AI-driven insights.",
      points: ["Org-specific dashboards", "User auditing & governance", "Sentiment analytics & reporting"],
      icon: <Network className="w-5 h-5 text-emerald-300" />
    },
    {
      label: "Layer 3",
      title: "Standard User",
      badge: "Employees",
      desc: "Employee-grade experience to create tickets with AI assistance and track resolutions in real time.",
      points: [
        "AI-powered ticket creation",
        "Semantic search",
        "Real-time status updates"
      ],
      icon: <Users className="w-5 h-5 text-emerald-300" />
    },
    {
      label: "Layer 4",
      title: "Public Layer",
      badge: "Prospects",
      desc: "A premium onboarding journey for potential customers with sales engineering engagement.",
      points: ["Guided sales experience", "Contact & support routes", "Premium journey & tier visibility"],
      icon: <HelpCircle className="w-5 h-5 text-emerald-300" />
    }
  ];

  const pipelineStages = [
    {
      step: "01",
      title: "Ingestion",
      desc: "Support tickets are accepted via email parsers, customer web widgets, or direct dashboard submission."
    },
    {
      step: "02",
      title: "Extraction",
      desc: "OCR extracts relevant text from screenshots; NER harvests technical identifiers and keywords."
    },
    {
      step: "03",
      title: "Classification",
      desc: "DistilBERT models predict category and compute priority based on urgency signals and technical context."
    },
    {
      step: "04",
      title: "Similarity Scan",
      desc: "Vector similarity identifies if a similar incident is already being resolved; duplicates are linked automatically."
    },
    {
      step: "05",
      title: "Auto-Resolution",
      desc: "If confidence thresholds are met, the system drafts/resolves and communicates updates back to the user."
    },
    {
      step: "06",
      title: "Smart Triage",
      desc: "Unresolved tickets route to the right engineering team queues with AI logs attached for auditability."
    }
  ];

  const techStack = [
    {
      category: "Frontend Experience",
      icon: <Laptop className="w-5 h-5 text-emerald-400" />,
      techs: ["React (Vite)", "Tailwind CSS", "Framer Motion", "Lucide React"]
    },
    {
      category: "Intelligence & Backend",
      icon: <Server className="w-5 h-5 text-emerald-400" />,
      techs: ["FastAPI (Python)", "Hugging Face Hub", "Transformers & PyTorch", "OCR + NER engines"]
    },
    {
      category: "Database & Services",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      techs: ["Supabase (PostgreSQL + RLS)", "pgvector (Similarity)", "Realtime webhooks", "SLA + audit services"]
    }
  ];

  const roadmap = [
    {
      phase: "Phase 1",
      title: "Core Ticketing & DistilBERT Categorization",
      status: "Shipped",
      desc: "Eliminate manual triage bottlenecks by categorizing tickets in milliseconds and routing with precision."
    },
    {
      phase: "Phase 2",
      title: "Multi-tenant SaaS Architecture",
      status: "Shipped",
      desc: "Secure tiered isolation using Supabase RLS so each organization remains properly isolated."
    },
    {
      phase: "Phase 3",
      title: "Generative Knowledge-Base Articles",
      status: "Shipped",
      desc: "Integrate GitHub Models to support generative resolution drafts and knowledge artifacts."
    },
    {
      phase: "Phase 4",
      title: "Enterprise Service Desk Sync",
      status: "In Progress",
      desc: "SAP / ServiceNow direct bidirectional sync to bring autonomy into existing enterprise workflows."
    },
    {
      phase: "Phase 5",
      title: "AI Voice Support Agent",
      status: "Planned",
      desc: "AI voice agent via Twilio for hands-free incident intake and real-time resolution assistance."
    }
  ];

  return (
    <div className="min-h-screen bg-[#021510] text-white relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[560px] h-[560px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[560px] h-[560px] bg-teal-400/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Navigation & Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <button
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all shadow-md w-fit"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <Pill>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GSSoC 2026 Compliant
            </Pill>
            <Pill>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
              Enterprise SaaS Architecture
            </Pill>
          </div>
        </motion.div>

        {/* HERO */}
        <section id="top" className="mb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={springIn}
            className="relative"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[720px] h-[320px] bg-gradient-to-r from-emerald-500/15 via-transparent to-teal-400/10 blur-2xl rounded-full pointer-events-none" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Neural System Orchestrator</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
                About
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent"> {"HELPDESK.AI"}</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                HELPDESK.AI is designed to end manual ticket triage. Using context-aware AI, semantic deduplication,
                and enterprise-grade multi-tenant architecture, we streamline support workflows from chaos to clarity.
              </p>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <GlowCard className="p-6">
                  <div className="flex items-start gap-3">
                    <Workflow className="w-5 h-5 text-emerald-300 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Milliseconds</p>
                      <h3 className="text-lg font-bold mt-1">AI-driven routing</h3>
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                        Categorize, prioritize, and triage with speed.
                      </p>
                    </div>
                  </div>
                </GlowCard>
                <GlowCard className="p-6">
                  <div className="flex items-start gap-3">
                    <Terminal className="w-5 h-5 text-emerald-300 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Audit-first</p>
                      <h3 className="text-lg font-bold mt-1">Transparent AI logs</h3>
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                        Every AI decision is tracked for operations and governance.
                      </p>
                    </div>
                  </div>
                </GlowCard>
                <GlowCard className="p-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-300 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Multi-tenant</p>
                      <h3 className="text-lg font-bold mt-1">SaaS isolation</h3>
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed">
                        Organization boundaries with secure configuration profiles.
                      </p>
                    </div>
                  </div>
                </GlowCard>
              </div>
            </div>
          </motion.div>
        </section>

        {/* MISSION & VISION */}
        <section id="mission" className="mb-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-400/5 pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-1 text-center lg:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Our Mission</span>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Eliminate the triage bottleneck</h2>
                <p className="text-gray-400 leading-relaxed mt-4">
                  We help engineering and IT support teams stop spending time on tagging, assigning, and routing.
                  Instead, HELPDESK.AI analyzes context, remembers historical resolutions, and automates resolutions at scale.
                </p>
              </div>

              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlowCard className="p-6">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-emerald-300 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-bold">Operational speed</h3>
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                          DistilBERT categorization and vector similarity scan enable instant prioritization and deduplication.
                        </p>
                      </div>
                    </div>
                  </GlowCard>
                  <GlowCard className="p-6">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-300 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-bold">Enterprise governance</h3>
                        <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                          Secure multi-tenant isolation with explicit permission layers and audit-friendly AI logs.
                        </p>
                      </div>
                    </div>
                  </GlowCard>
                </div>

                <div className="mt-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Our Vision</span>
                  <h3 className="text-2xl font-bold tracking-tight">A self-driving support ecosystem</h3>
                  <p className="text-gray-400 mt-4 leading-relaxed">
                    We envision a future where repetitive incidents are resolved before they become ticket floods.
                    With proactive resolution suggestions, semantic duplicate clustering, and reliable triage routing,
                    support operations become predictable and scalable.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* WHY HELPDESK.AI */}
        <section id="why" className="mb-28">
          <SectionHeading
            eyebrow="Business Value"
            title="Why HELPDESK.AI"
            subtitle="Massive ROI by turning ticket intake into an intelligent orchestration pipeline—built for enterprise operations."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
                title: "Eliminating manual triage",
                desc: "Context-aware classification routes requests immediately—bypassing the L1 bottleneck and reducing agent workload."
              },
              {
                icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
                title: "Proactive resolution drafts",
                desc: "Integrated LLM intelligence reviews issues at creation time to suggest “Instant Fixes,” reducing actual ticket volume."
              },
              {
                icon: <Layers className="w-6 h-6 text-emerald-400" />,
                title: "Tiered multi-tenancy",
                desc: "Secure SaaS isolation keeps separate companies properly bounded within a single platform environment."
              },
              {
                icon: <Clock className="w-6 h-6 text-emerald-400" />,
                title: "Operational consistency",
                desc: "AI logs, deterministic routing, and structured workflows create repeatable support outcomes across teams."
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ scale: 1.015 }}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl transition-colors duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-all shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* AI-POWERED FEATURES */}
        <section id="features" className="mb-28">
          <SectionHeading
            eyebrow="AI-Powered"
            title="AI-powered features"
            subtitle="Designed to reduce time-to-resolution and increase consistency with context-aware classification, extraction, and auto-triage."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {aiFeatures.map((f, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.35)" }}
                className="bg-white/5 border border-white/10 p-7 rounded-3xl backdrop-blur-xl hover:shadow-[0_0_60px_rgba(16,185,129,0.10)] transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">{f.icon}</div>
                    <h3 className="text-lg font-bold text-white">{f.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* PERMISSION MATRIX */}
        <section id="permissions" className="mb-28">
          <SectionHeading
            eyebrow="Security & Governance"
            title="4-layer permission matrix"
            subtitle="Designed for true SaaS isolation with role clarity across global oversight, org administration, employee workflows, and public onboarding."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {permissionLayers.map((layer, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
                className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/12 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        {layer.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">{layer.label}</div>
                        <h3 className="text-xl font-bold text-white leading-tight">{layer.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{layer.badge}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center text-xs font-bold rounded-full px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      Enterprise
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-5">{layer.desc}</p>

                  <ul className="space-y-3">
                    {layer.points.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-3">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-gray-200 text-sm">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* AI NEURAL PIPELINE WORKFLOW */}
        <section id="pipeline" className="mb-28">
          <SectionHeading
            eyebrow="End-to-End Workflow"
            title="AI neural pipeline workflow"
            subtitle="From ingestion to smart triage: classification, extraction, similarity linking, and confidence-based resolution."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {pipelineStages.map((stage, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden backdrop-blur-xl"
                whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.35)" }}
              >
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-300 font-extrabold text-xs border border-emerald-500/25">
                    {stage.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{stage.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2">{stage.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-10">
            <GlowCard className="p-7 md:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Neural pipeline under the hood</h3>
                  <p className="text-gray-400 mt-4 leading-relaxed">
                    HELPDESK.AI uses a production-oriented pipeline:
                    <span className="text-emerald-300 font-semibold"> high-precision classification</span>,
                    <span className="text-emerald-300 font-semibold"> NER metadata harvesting</span>,
                    <span className="text-emerald-300 font-semibold"> duplicate prevention</span>,
                    and <span className="text-emerald-300 font-semibold"> generative OCR</span>.
                    Together, these blocks produce structured incident signals and faster resolutions.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[{ icon: <BookOpen className="w-5 h-5 text-emerald-300" />, t: "Classification", d: "DistilBERT routes by context and urgency." },
                    { icon: <Layers className="w-5 h-5 text-emerald-300" />, t: "NER Harvesting", d: "Extract hostnames & technical identifiers." },
                    { icon: <Workflow className="w-5 h-5 text-emerald-300" />, t: "Deduplication", d: "Sentence-transformers prevent flooding." },
                    { icon: <Zap className="w-5 h-5 text-emerald-300" />, t: "Generative OCR", d: "Pulls error codes from screenshots." }].map((x, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">{x.icon}</div>
                          <div className="text-sm font-bold text-white">{x.t}</div>
                        </div>
                        <div className="text-xs text-gray-400 leading-relaxed">{x.d}</div>
                      </div>
                    ))}
                </div>
              </div>
            </GlowCard>
          </div>
        </section>

        {/* TECH STACK / SYSTEM ARCHITECTURE */}
        <section id="architecture" className="mb-28">
          <SectionHeading
            eyebrow="Architecture"
            title="Tech stack & system architecture"
            subtitle="A clean, decoupled architecture built for production operations—fast inference, structured signals, and secure multi-tenant data flows."
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10"
          >
            {techStack.map((stack, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden"
                whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.35)" }}
              >
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/12 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">{stack.icon}</div>
                    <h3 className="text-lg font-bold text-white leading-tight">{stack.category}</h3>
                  </div>
                  <ul className="space-y-3">
                    {stack.techs.map((tech, techIdx) => (
                      <li key={techIdx} className="flex items-center gap-2.5 text-gray-400 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <GlowCard className="p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AppWindow className="w-5 h-5 text-emerald-300" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">System Overview</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight">From user submissions to AI inference and real-time updates</h3>
                <p className="text-gray-400 mt-4 leading-relaxed">
                  The frontend sends incident payloads to a FastAPI backend. The inference engine runs classifier,
                  NER extraction, OCR processing, and knowledge generation, then commits structured results to Supabase.
                  Realtime updates synchronize dashboards and admin portals.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{ k: "Inference Engine", v: "Classification + NER + OCR + Gen" },
                    { k: "Routing", v: "Queue routing with confidence & similarity" },
                    { k: "Data Layer", v: "Supabase + pgvector" },
                    { k: "Realtime", v: "Webhooks & updates to UI" }].map((x, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">{x.k}</div>
                        <div className="text-sm text-gray-200 mt-2">{x.v}</div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">Reference Architecture</div>
                  <span className="text-xs font-bold text-gray-400">Production-oriented</span>
                </div>
                <div className="overflow-x-auto">
                  <pre className="text-[12px] leading-relaxed text-gray-300 whitespace-pre">
{`User (Frontend)\n  → Submits Issue\nFastAPI Backend\n  → Text Processing\nAI Inference Engine\n  → DistilBERT v3 (Categorization Routing)\n  → NER Engine (Entity Extraction)\n  → Generative OCR (Extract error codes)\n  → Generative Resolves (LLM knowledge)\nSupabase DB\n  → Store structured incidents + vectors\nRealtime WebSocket/Updates\n  → Dashboard aggregation + admin visibility`}
                  </pre>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  Note: Diagram text representation (keeps the page self-contained without external Mermaid rendering).
                </div>
              </div>
            </div>
          </GlowCard>
        </section>

        {/* MOBILE ECOSYSTEM */}
        <section id="mobile" className="mb-28">
          <SectionHeading
            eyebrow="Mobile"
            title="Mobile ecosystem"
            subtitle="A mobile-first helpdesk experience for employees and admins with real-time updates and secure access patterns."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
              whileHover={{ borderColor: "rgba(16,185,129,0.35)" }}
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/12 to-transparent opacity-80" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <Phone className="w-5 h-5 text-emerald-300" />
                  <h3 className="text-2xl font-bold tracking-tight">Helpdesk.ai (Android V1)</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  HELPDESK.AI is now available as a native Android application featuring a complete mobile-first experience
                  for employees and admins.
                </p>

                <ul className="mt-6 space-y-3">
                  {["Real-time status tracking with instant progress updates",
                    "Biometric-ready access patterns",
                    "Smart onboarding for new users and pending registrations",
                    "Session replay integration for proactive debugging (e.g., LogRocket)"]
                    .map((x, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-gray-200 text-sm leading-relaxed">{x}</span>
                      </li>
                    ))}
                </ul>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="./MobileApp/application-2d277b36-4dbd-41c8-806d-cb2f19acf38a.apk"
                    target="_self"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]"
                  >
                    <ExternalLink size={18} />
                    Download HelpDesk.ai V1 APK
                  </a>
                  <a
                    href="/contact-sales"
                    className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3 rounded-xl transition-all"
                  >
                    <HelpCircle size={18} />
                    Talk to Sales
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-teal-400/10 via-transparent to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <Workflow className="w-5 h-5 text-emerald-300" />
                  <h3 className="text-2xl font-bold tracking-tight">Mobile-first experiences</h3>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Mobile users can submit incidents quickly, search by context, and stay updated without chasing tickets.
                </p>

                <div className="mt-7 grid grid-cols-1 gap-4">
                  {[{ icon: <MessageSquareText className="w-5 h-5 text-emerald-300" />, t: "AI-assisted submission", d: "Structured ticket intake with fewer fields and better metadata." },
                    { icon: <Layers className="w-5 h-5 text-emerald-300" />, t: "Semantic search", d: "Find similar incidents through vector similarity—faster triage." },
                    { icon: <Clock className="w-5 h-5 text-emerald-300" />, t: "Real-time status", d: "Updates reflected quickly across employee and admin views." },
                    { icon: <ShieldCheck className="w-5 h-5 text-emerald-300" />, t: "Secure access", d: "Enterprise-friendly authentication patterns and permission boundaries." }].map((x, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">{x.icon}</div>
                      <div>
                        <div className="font-bold text-white">{x.t}</div>
                        <div className="text-sm text-gray-400 mt-1 leading-relaxed">{x.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 text-xs text-gray-500">
                  The mobile app uses the same enterprise pipeline principles: consistent AI outputs, secure multi-tenant boundaries, and reliable updates.
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ROADMAP */}
        <section id="roadmap" className="mb-28">
          <SectionHeading
            eyebrow="Delivery"
            title="Product roadmap timeline"
            subtitle="A phased path from core triage automation to enterprise integrations and multimodal support."
          />

          <div className="relative">
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-emerald-500/40 via-white/10 to-teal-400/30" />
            <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
              {roadmap.map((r, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`${isLeft ? "md:pr-10" : "md:pl-10"} relative`}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-7 md:p-8 relative overflow-hidden hover:border-emerald-500/30 transition-colors">
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">{r.phase}</div>
                            <h3 className="text-xl font-bold mt-2 text-white">{r.title}</h3>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                              r.status === "Shipped"
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                                : r.status === "In Progress"
                                  ? "bg-teal-400/10 border-teal-400/30 text-teal-200"
                                  : "bg-white/5 border-white/10 text-gray-200"
                            }`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-4 leading-relaxed">{r.desc}</p>

                        <div className="mt-5 flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs text-gray-300">
                            Built to scale support without scaling headcount.
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* OSS / GSSoC CONTRIBUTION */}
        <section id="oss" className="mb-28">
          <SectionHeading
            eyebrow="Community"
            title="Open source & GSSoC contribution"
            subtitle="Built with a community mindset—contribute to the Neural System Orchestrator and help shape enterprise-grade autonomy."
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="lg:col-span-2"
            >
              <GlowCard className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-5">
                  <Users className="w-5 h-5 text-emerald-300" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">GSSoC 2026 Contributor & Community Campaign</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Support the Orchestrator in 3 seconds</h3>
                <p className="text-gray-400 mt-4 leading-relaxed">
                  HELPDESK.AI is proudly participating in **GirlScript Summer of Code (GSSoC) 2026**.
                  To ensure high-quality contributions and maximum rewards for both developers and mentors,
                  please review our official mentorship guide and review standard.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <a
                    href="https://github.com/ritesh-1918/HELPDESK.AI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]"
                  >
                    <Code size={18} />
                    Star Repository
                  </a>
                  <a
                    href="https://github.com/ritesh-1918/HELPDESK.AI/fork"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-xl transition-all"
                  >
                    <Github size={18} />
                    Fork
                  </a>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://github.com/ritesh-1918"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-xl transition-all"
                  >
                    <ExternalLink size={18} />
                    Follow Owner
                  </a>
                  <a
                    href="https://github.com/ritesh-1918/HELPDESK.AI/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-xl transition-all"
                  >
                    <HelpCircle size={18} />
                    Good First Issues
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[{
                    href: "./MENTORSHIP.md",
                    title: "Mentorship Guide",
                    subtitle: "Review standard & expectations",
                    icon: <BookOpen size={18} className="text-emerald-300" />
                  },{
                    href: "https://github.com/ritesh-1918/HELPDESK.AI/discussions",
                    title: "Community Discussions",
                    subtitle: "Collaborate with contributors",
                    icon: <MessageSquareText size={18} className="text-emerald-300" />
                  },{
                    href: "mailto:support@helpdesk.ai",
                    title: "Contact",
                    subtitle: "Enterprise + community support",
                    icon: <ExternalLink size={18} className="text-emerald-300" />
                  }].map((x, i) => (
                    <a
                      key={i}
                      href={x.href}
                      target={x.href.startsWith("http") ? "_blank" : "_self"}
                      rel={x.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl hover:border-emerald-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">{x.icon}</div>
                        <div className="font-bold text-white">{x.title}</div>
                      </div>
                      <div className="text-xs text-gray-400 leading-relaxed">{x.subtitle}</div>
                    </a>
                  ))}
                </div>
              </GlowCard>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeInUp}
              className="h-fit"
            >
              <GlowCard className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Github className="w-5 h-5 text-emerald-300" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-300">Repository</div>
                    <div className="text-lg font-bold text-white">HELPDESK.AI</div>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Explore the codebase, system architecture, and workflow logic. Contributions help harden the enterprise pipeline.
                </p>

                <div className="mt-6 space-y-4">
                  <a
                    href="https://ritesh-1918.github.io/HELPDESK.AI/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-4 backdrop-blur-xl transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">System Presentation</div>
                      <div className="text-xs text-gray-400 mt-1">Project overview</div>
                    </div>
                    <ExternalLink size={18} className="text-gray-400" />
                  </a>

                  <a
                    href="https://ritesh19180-ai-helpdesk-api.hf.space/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-4 backdrop-blur-xl transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white">API Documentation</div>
                      <div className="text-xs text-gray-400 mt-1">Swagger + system docs</div>
                    </div>
                    <ExternalLink size={18} className="text-gray-400" />
                  </a>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pb-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-400/8" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Layers className="w-4 h-4 text-emerald-300" />
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">HELPDESK.AI</span>
                  </div>
                  <p className="text-gray-400 mt-4 leading-relaxed">
                    A premium enterprise helpdesk orchestrated by neural services—classification, extraction, semantic deduplication,
                    and confidence-based resolution.
                  </p>
                  <div className="mt-6">
                    <a
                      href="https://github.com/ritesh-1918/HELPDESK.AI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg"
                    >
                      <Github size={18} />
                      Visit GitHub
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 w-full md:w-auto">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">Product</div>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#features" className="text-gray-300 hover:text-emerald-300 transition-colors">AI Features</a>
                      </li>
                      <li>
                        <a href="#pipeline" className="text-gray-300 hover:text-emerald-300 transition-colors">Neural Pipeline</a>
                      </li>
                      <li>
                        <a href="#architecture" className="text-gray-300 hover:text-emerald-300 transition-colors">System Architecture</a>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">Enterprise</div>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#permissions" className="text-gray-300 hover:text-emerald-300 transition-colors">Permission Matrix</a>
                      </li>
                      <li>
                        <a href="#mobile" className="text-gray-300 hover:text-emerald-300 transition-colors">Mobile Ecosystem</a>
                      </li>
                      <li>
                        <a href="#roadmap" className="text-gray-300 hover:text-emerald-300 transition-colors">Roadmap</a>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-3">Community</div>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#oss" className="text-gray-300 hover:text-emerald-300 transition-colors">GSSoC Contributions</a>
                      </li>
                      <li>
                        <a href="/terms-of-service" className="text-gray-300 hover:text-emerald-300 transition-colors">Terms</a>
                      </li>
                      <li>
                        <a href="/privacy-policy" className="text-gray-300 hover:text-emerald-300 transition-colors">Privacy</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="text-xs text-gray-500">
                  © {new Date().getFullYear()} HELPDESK.AI. Built with <span className="text-emerald-300 font-semibold">💚</span> by the HELPDESK.AI Professional Team.
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Enterprise-grade UI + AI orchestration
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </footer>
      </div>
    </div>
  );
};

export default AboutUs;

