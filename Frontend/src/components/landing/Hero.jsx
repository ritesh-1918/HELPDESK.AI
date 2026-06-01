import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, ArrowRight, Play, Check, Clock, MapPin,
  Folder, AlertCircle, Search, Bell, Mail, Bot
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const slideInRightVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: 'easeOut' }
  }
};

export default function Hero({ onDemoClick, onGetStartedClick }) {
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <section className="relative min-h-screen bg-white overflow-hidden flex items-center">
      {/* Background gradient accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-100/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main content container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-0">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* LEFT COLUMN: Text & CTAs */}
          <motion.div className="flex flex-col justify-center space-y-8" variants={fadeInUpVariants}>
            {/* AI Badge */}
            <motion.div
              className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 w-fit"
              variants={fadeInUpVariants}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase">AI-Powered Helpdesk · Made in India 🇮🇳</span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeInUpVariants}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                Your IT<br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Helpdesk,
                </span>
                <br />
                Fully Automated
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg"
              variants={fadeInUpVariants}
            >
              Turn messy user complaints into structured, categorized, and prioritized support tickets — instantly. No manual triage. No missed urgencies.
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" variants={fadeInUpVariants}>
              <motion.button
                onClick={onGetStartedClick}
                className="group relative px-8 py-4 bg-emerald-900 text-white rounded-xl font-bold text-base shadow-xl shadow-emerald-900/25 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </span>
              </motion.button>

              <motion.button
                onClick={onDemoClick}
                className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-semibold text-base hover:border-emerald-500 hover:text-emerald-700 transition-all flex items-center justify-center gap-2"
                whileHover={{ borderColor: '#059669', scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-4 h-4 fill-current" /> Watch Demo
              </motion.button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div className="flex gap-8 pt-6" variants={fadeInUpVariants}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-sm">
                  <div className="font-bold text-gray-900">99% Accuracy</div>
                  <div className="text-gray-500 text-xs">Classification</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-sm">
                  <div className="font-bold text-gray-900">24/7 Support</div>
                  <div className="text-gray-500 text-xs">Auto Resolution</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Product Showcase */}
          <motion.div
            className="relative h-[500px] md:h-[600px] lg:h-[650px] hidden lg:flex items-center justify-center"
            variants={slideInRightVariants}
          >
            {/* Glassmorphism cards container */}
            <div className="relative w-full h-full flex items-center justify-center perspective">
              {/* Background blur element */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white/30 to-teal-50/50 rounded-3xl blur-2xl" />

              {/* Incoming Complaint Card - Top Left */}
              <motion.div
                className="absolute w-72 md:w-80 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl shadow-emerald-500/10 p-5 md:p-6 cursor-grab active:cursor-grabbing"
                style={{
                  top: '10%',
                  left: '5%',
                  zIndex: hoveredCard === 'incoming' ? 30 : 20
                }}
                onHoverStart={() => setHoveredCard('incoming')}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{
                  y: -8,
                  boxShadow: '0 20px 50px rgba(16, 185, 129, 0.25)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Incoming</span>
                  </div>
                  <span className="text-xs text-gray-400">2m ago</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-xs text-purple-600">S</div>
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">Sarah Connors</div>
                    <div className="text-xs text-gray-500">sarah@uni.edu</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  "Hey, WiFi in <span className="bg-yellow-100 px-1 rounded">Lab 3</span> is down. Class in 20 mins. <span className="font-semibold">URGENT!</span>"
                </p>
              </motion.div>

              {/* Arrow indicator */}
              <motion.div
                className="absolute left-1/3 top-1/2 -translate-y-1/2 text-emerald-300 opacity-40"
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="w-8 h-8" />
              </motion.div>

              {/* AI Processing Card - Center */}
              <motion.div
                className="absolute w-80 md:w-96 bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-teal-400/10 backdrop-blur-2xl rounded-2xl border border-emerald-300/40 shadow-2xl p-6 flex flex-col items-center justify-center gap-6"
                style={{
                  top: '30%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: hoveredCard === 'processing' ? 30 : 25
                }}
                onHoverStart={() => setHoveredCard('processing')}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{
                  y: -12,
                  boxShadow: '0 30px 60px rgba(5, 200, 140, 0.2)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 flex items-center justify-center mx-auto mb-4"
                    animate={{ scale: [1, 1.1, 1], y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Bot className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <div className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">Processing</div>
                  <div className="text-sm font-bold text-white">AI Transformation</div>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-center">
                    <div className="text-[10px] font-bold text-white/60 uppercase mb-1">Priority</div>
                    <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> High
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-center">
                    <div className="text-[10px] font-bold text-white/60 uppercase mb-1">Category</div>
                    <div className="text-xs font-bold text-white">Network</div>
                  </div>
                </div>
              </motion.div>

              {/* Generated Ticket Card - Bottom Right */}
              <motion.div
                className="absolute w-80 md:w-96 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/70 shadow-2xl shadow-emerald-500/15 overflow-hidden"
                style={{
                  bottom: '5%',
                  right: '5%',
                  zIndex: hoveredCard === 'ticket' ? 30 : 20
                }}
                onHoverStart={() => setHoveredCard('ticket')}
                onHoverEnd={() => setHoveredCard(null)}
                whileHover={{
                  y: -10,
                  boxShadow: '0 25px 50px rgba(16, 185, 129, 0.2)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">#T-4029</span>
                    <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wide backdrop-blur-sm">Resolved</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">WiFi Connectivity Issue</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Clock className="w-3 h-3" /> Created 1m ago <span>•</span> via Email
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Priority
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm font-bold text-gray-800">High</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                        <Folder className="w-3 h-3" /> Category
                      </div>
                      <span className="text-sm font-bold text-gray-800">Network</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 col-span-2">
                      <div className="text-[10px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </div>
                      <div className="text-sm font-bold text-gray-800">Lab 3 (Downstairs)</div>
                    </div>
                  </div>
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>

              {/* Subtle floating particle accents */}
              <motion.div
                className="absolute w-1 h-1 rounded-full bg-emerald-400 opacity-40"
                style={{ top: '20%', right: '20%' }}
                animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full bg-teal-300 opacity-30"
                style={{ top: '60%', left: '10%' }}
                animate={{ y: [0, -15, 0], x: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Mobile: Simplified showcase */}
          <motion.div className="lg:hidden space-y-4" variants={fadeInUpVariants}>
            {/* Mobile incoming card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg p-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-bold text-gray-500 uppercase">Incoming</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3">
                "WiFi in <span className="font-semibold">Lab 3</span> is down. Need fixed ASAP!"
              </p>
            </div>

            {/* Mobile processing indicator */}
            <div className="text-center py-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
              >
                <Bot className="w-4 h-4 text-emerald-600" />
              </motion.div>
            </div>

            {/* Mobile resolved card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="bg-emerald-600 px-4 py-2 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">#T-4029</span>
                <span className="text-[10px] font-bold text-white/80">RESOLVED</span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-2">WiFi Connectivity Issue</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Priority: <span className="font-bold text-red-500">High</span></div>
                  <div>Category: <span className="font-bold text-gray-800">Network</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
