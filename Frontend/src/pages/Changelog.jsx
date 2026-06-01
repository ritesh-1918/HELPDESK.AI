import React from "react";
import {
  Rocket,
  Sparkles,
  Bug,
  ShieldCheck,
  CalendarDays,
  GitCommitHorizontal,
} from "lucide-react";

import { motion } from "framer-motion";

const releases = [
  {
    version: "v2.1.0",
    date: "May 20, 2026",
    type: "Major Release",
    status: "Live",
    features: [
      "Introduced AI-powered smart ticket routing engine",
      "Added enterprise analytics dashboard with live metrics",
      "Integrated multilingual support for global organizations",
    ],
    enhancements: [
      "Improved dashboard loading performance by 35%",
      "Enhanced accessibility contrast and readability",
      "Optimized backend request caching for faster responses",
    ],
    fixes: [
      "Fixed session timeout issue after inactivity",
      "Resolved notification synchronization bug",
      "Fixed mobile sidebar overlap on smaller devices",
    ],
  },

  {
    version: "v2.0.2",
    date: "May 10, 2026",
    type: "Patch Update",
    status: "Stable",
    features: [
      "Added bulk export functionality for support tickets",
      "Introduced advanced ticket filtering system",
    ],
    enhancements: [
      "Improved authentication flow security",
      "Optimized API request handling",
    ],
    fixes: [
      "Resolved login redirect issue",
      "Fixed navbar responsiveness on tablets",
    ],
  },

  {
    version: "v2.0.0",
    date: "April 28, 2026",
    type: "Platform Launch",
    status: "Released",
    features: [
      "Official launch of HelpDesk.AI platform",
      "AI-based issue auto-categorization system",
      "Role-based admin management implementation",
    ],
    enhancements: [
      "Modernized UI architecture using Tailwind CSS",
      "Improved dark mode consistency",
    ],
    fixes: [
      "Initial stability improvements",
      "Security hardening patches",
    ],
  },
];

const FadeIn = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const Section = ({
  title,
  icon,
  items,
  glow,
}) => {
  return (
    <div className="mb-8">

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-xl ${glow}`}
        >
          {icon}
        </div>

        <h3 className="text-2xl font-semibold text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ x: 6 }}
            className="flex gap-3 text-gray-300 leading-relaxed"
          >
            <span className="text-green-400 mt-1">
              •
            </span>

            <p>{item}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Changelog = () => {
  return (
    <div className="min-h-screen bg-[#021510] overflow-hidden text-white relative">

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-500/10 blur-[120px]" />

      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-400/10 blur-[120px]" />

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-24 pb-16">

        <motion.div
          initial="hidden"
          animate="visible"
          variants={FadeIn}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto text-center"
        >

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-5 py-2 rounded-full text-green-400 mb-8 backdrop-blur-md">

            <GitCommitHorizontal size={16} />

            <span className="text-sm font-medium tracking-wide">
              PRODUCT RELEASE NOTES
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">

            Platform
            <span className="text-green-400">
              {" "}Changelog
            </span>
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">

            Stay updated with the latest platform improvements,
            AI enhancements, security patches, and feature
            releases across HelpDesk.AI.
          </p>

        </motion.div>
      </section>

      {/* Timeline */}
      <section className="relative z-10 px-6 pb-24">

        <div className="max-w-5xl mx-auto relative">

          {/* Vertical Line */}
          <div className="absolute left-4 top-0 w-[2px] h-full bg-gradient-to-b from-green-500/70 via-green-500/20 to-transparent" />

          {/* Release Cards */}
          <div className="space-y-16">

            {releases.map((release, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={FadeIn}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                className="relative pl-14"
              >

                {/* Timeline Dot */}
                <div className="absolute left-0 top-8">

                  <div className="w-8 h-8 rounded-full bg-green-500 border-4 border-[#021510] shadow-[0_0_25px_rgba(34,197,94,0.8)]" />

                </div>

                {/* Card */}
                <motion.div
                  whileHover={{
                    scale: 1.01,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="relative bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden"
                >

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />

                  {/* Header */}
                  <div className="relative flex flex-wrap items-center justify-between gap-4 mb-10">

                    <div className="flex items-center gap-4 flex-wrap">

                      {/* Version */}
                      <div className="bg-green-500 text-black font-bold px-5 py-2 rounded-full text-sm shadow-lg">
                        {release.version}
                      </div>

                      {/* Type */}
                      <div className="bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-full text-sm">
                        {release.type}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 text-green-400 text-sm">

                        <ShieldCheck size={16} />

                        {release.status}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-gray-400">

                      <CalendarDays size={18} />

                      <span>{release.date}</span>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="relative">

                    <Section
                      title="New Features"
                      glow="bg-green-500/20"
                      icon={
                        <Rocket className="text-green-400" />
                      }
                      items={release.features}
                    />

                    <Section
                      title="Enhancements"
                      glow="bg-blue-500/20"
                      icon={
                        <Sparkles className="text-blue-400" />
                      }
                      items={release.enhancements}
                    />

                    <Section
                      title="Bug Fixes"
                      glow="bg-red-500/20"
                      icon={
                        <Bug className="text-red-400" />
                      }
                      items={release.fixes}
                    />

                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Changelog;