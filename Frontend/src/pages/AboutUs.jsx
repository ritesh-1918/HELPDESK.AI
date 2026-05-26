import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Code
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
      staggerChildren: 0.1
    }
  }
};

const AboutUs = () => {
  const navigate = useNavigate();

  const capabilities = [
    {
      icon: <FolderOpen className="w-6 h-6 text-emerald-400" />,
      title: "AI Classification",
      desc: "Instantly categorizes requests into Network, Hardware, Software, or Access categories using natural language understanding."
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      title: "Smart Resolution",
      desc: "Leverages historical ticket resolutions to automatically generate accurate solution drafts or self-solve simple issues."
    },
    {
      icon: <Layers className="w-6 h-6 text-emerald-400" />,
      title: "Duplicate Detection",
      desc: "Uses vector similarity search to identify and group duplicate incident reports in real time, preventing agent alert fatigue."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: "Multi-Tenant Isolation",
      desc: "Ensures strict enterprise-grade security isolation and customized configuration profiles for each registered organization."
    }
  ];

  const pipelineStages = [
    {
      step: "01",
      title: "Ingestion",
      desc: "Support tickets are ingested seamlessly via email parsers, customer web widgets, or direct dashboard submission."
    },
    {
      step: "02",
      title: "Extraction",
      desc: "System runs OCR to extract text from screenshots and applies Named Entity Recognition (NER) to pull system names and keywords."
    },
    {
      step: "03",
      title: "Classification",
      desc: "Advanced NLP models predict the correct ticket category and calculate priority based on urgency cues."
    },
    {
      step: "04",
      title: "Similarity Scan",
      desc: "A vector similarity scan determines if this incident is already being resolved, linking duplicate cases automatically."
    },
    {
      step: "05",
      title: "Auto-Resolution",
      desc: "Matched resolutions are evaluated; if confidence thresholds are met, the system auto-resolves the ticket and emails the user."
    },
    {
      step: "06",
      title: "Smart Triage",
      desc: "Unresolved tickets are automatically routed to the precise engineering team queues with complete AI logs attached."
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
      techs: ["FastAPI (Python)", "Hugging Face Hub", "Transformers & PyTorch", "OCR Engine"]
    },
    {
      category: "Database & Services",
      icon: <Database className="w-5 h-5 text-emerald-400" />,
      techs: ["Supabase", "PostgreSQL", "pgvector (Similarity)", "Realtime Webhooks"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#021510] text-white relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-400/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* Navigation & Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 flex justify-between items-center"
        >
          <button 
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all shadow-md"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">GSSoC 2026 Compliant</span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <section className="text-center mb-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              About
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                {" "}HELPDESK.AI
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-8">
              A modern, intelligent, and autonomous helpdesk platform designed to end manual ticket triage. By utilizing advanced Natural Language Processing and Vector similarity, we streamline support workflows from chaos to clarity.
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
            className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-4 block">Our Vision</span>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white tracking-tight">
                "Eliminating manual ticket routing and solving repeating support incidents instantly."
              </h2>
              <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
                We believe engineering and IT support teams shouldn't spend their valuable hours reviewing, tagging, and assigning tickets. Our vision is a self-driving support ecosystem that analyzes context, remembers historical resolutions, and automates resolution at scale.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Core Capabilities */}
        <section className="mb-28">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Platform Intelligence</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Core Capabilities</h2>
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
                className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl transition-colors duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-all shadow-inner">
                  {cap.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{cap.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* AI Pipeline Architecture */}
        <section className="mb-28">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">System Workflow</span>
            <h2 className="text-3xl font-extrabold tracking-tight">AI Pipeline Architecture</h2>
            <p className="text-gray-400 mt-2 text-sm">How HELPDESK.AI processes and resolves issues in milliseconds</p>
          </div>

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
                className="bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden backdrop-blur-xl hover:border-emerald-500/20 transition-colors"
              >
                <div className="absolute top-4 right-4 text-4xl font-extrabold text-emerald-500/10 select-none">
                  {stage.step}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs mb-4 border border-emerald-500/25">
                  {stage.step}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{stage.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{stage.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Tech Stack Grid */}
        <section className="mb-28">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">Technology Stack</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Built with Modern Tech</h2>
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {techStack.map((stack, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    {stack.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{stack.category}</h3>
                </div>
                <ul className="space-y-3">
                  {stack.techs.map((tech, techIdx) => (
                    <li key={techIdx} className="flex items-center gap-2.5 text-gray-400 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {tech}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Resource Links */}
        <section className="mb-28">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 block">External Resources</span>
            <h2 className="text-3xl font-extrabold tracking-tight">Project Documentation & Links</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.a
              href="https://github.com/ritesh-1918/HELPDESK.AI"
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
                  <p className="text-xs text-gray-500">Source code & issues</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </motion.a>

            <motion.a
              href="#"
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group backdrop-blur-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  <BookOpen size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white">API Reference</h4>
                  <p className="text-xs text-gray-500">Swagger & system docs</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </motion.a>

            <motion.a
              href="#"
              whileHover={{ y: -4, borderColor: "rgba(16,185,129,0.3)" }}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group backdrop-blur-xl transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Platform Demo</h4>
                  <p className="text-xs text-gray-500">Video & Presentation</p>
                </div>
              </div>
              <ExternalLink size={16} className="text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </motion.a>
          </div>
        </section>

        {/* Community & GSSoC Section */}
        <section>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-gradient-to-br from-emerald-950/80 to-emerald-900/50 border border-emerald-500/25 rounded-3xl p-8 md:p-12 text-center backdrop-blur-xl"
          >
            <div className="max-w-2xl mx-auto">
              <Users size={40} className="text-emerald-400 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Join our Community</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-8">
                HELPDESK.AI is proudly participating in GSSoC 2026. We are built by and for the open source community. Explore our issues, raise a pull request, and help us design the future of autonomous helpdesks!
              </p>
              <a
                href="https://github.com/ritesh-1918/HELPDESK.AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20"
              >
                <Code size={18} />
                Start Contributing
              </a>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
};

export default AboutUs;
