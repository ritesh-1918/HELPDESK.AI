import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Layers,
  Tag,
  AlertCircle,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  FileText,
  BrainCircuit,
  LayoutGrid,
  CheckCircle2,
  ImageIcon,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import useTicketStore from '../../store/ticketStore';
import { Card, CardContent } from '../../components/ui/card';

// ─── Shimmer Skeleton ────────────────────────────────────────────────
const Shimmer = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${className}`}>
    <div className='absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent' />
  </div>
);

const SkeletonLoader = () => (
  <div className='min-h-screen bg-[#f6f8f7] pb-20 pt-32 px-6'>
    <div className='w-full max-w-[900px] mx-auto space-y-8'>
      {/* Header skeleton */}
      <div className='text-center space-y-3'>
        <Shimmer className='h-8 w-72 mx-auto' />
        <Shimmer className='h-4 w-96 mx-auto' />
      </div>

      {/* Pipeline skeleton */}
      <div className='flex items-center justify-center gap-4 py-4'>
        {[1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <div className='flex flex-col items-center gap-2'>
              <Shimmer className='w-10 h-10 rounded-full' />
              <Shimmer className='h-3 w-16' />
            </div>
            {i < 4 && <Shimmer className='h-0.5 w-12 mt-[-20px]' />}
          </React.Fragment>
        ))}
      </div>

      {/* Summary skeleton */}
      <Card className='rounded-xl border border-gray-100 shadow-sm bg-white'>
        <CardContent className='p-8 flex items-start gap-6'>
          <Shimmer className='w-14 h-14 rounded-full shrink-0' />
          <div className='flex-1 space-y-3'>
            <Shimmer className='h-3 w-32' />
            <Shimmer className='h-5 w-full' />
            <Shimmer className='h-5 w-3/4' />
          </div>
        </CardContent>
      </Card>

      {/* Grid skeleton */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <Card className='rounded-xl border border-gray-100 shadow-sm bg-white'>
          <CardContent className='p-8 space-y-5'>
            <Shimmer className='h-4 w-32' />
            <Shimmer className='h-8 w-40' />
            <div className='grid grid-cols-2 gap-4 pt-2'>
              <div className='space-y-2'>
                <Shimmer className='h-3 w-16' />
                <Shimmer className='h-6 w-20' />
              </div>
              <div className='space-y-2'>
                <Shimmer className='h-3 w-24' />
                <Shimmer className='h-6 w-28' />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className='space-y-8'>
          <Card className='rounded-xl border border-gray-100 shadow-sm bg-white'>
            <CardContent className='p-8 space-y-4'>
              <Shimmer className='h-4 w-48' />
              <div className='flex flex-wrap gap-2'>
                <Shimmer className='h-7 w-20 rounded-full' />
                <Shimmer className='h-7 w-24 rounded-full' />
                <Shimmer className='h-7 w-28 rounded-full' />
              </div>
            </CardContent>
          </Card>
          <Card className='rounded-xl border border-gray-100 shadow-sm bg-white'>
            <CardContent className='p-8 space-y-3'>
              <Shimmer className='h-4 w-40' />
              <Shimmer className='h-2.5 w-full rounded-full' />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────
const AIUnderstanding = () => {
  const navigate = useNavigate();
  const aiTicket = useTicketStore((state) => state.aiTicket);
  const setAITicket = useTicketStore((state) => state.setAITicket);

  const [isLoading, setIsLoading] = useState(true);
  const [editedIssue, setEditedIssue] = useState('');
  const [explainerOpen, setExplainerOpen] = useState(false);

  // Simulate a brief load to allow store hydration
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !aiTicket) {
      navigate('/create-ticket');
    }
  }, [isLoading, aiTicket, navigate]);

  useEffect(() => {
    if (aiTicket?.originalIssue) {
      setEditedIssue(aiTicket.originalIssue);
    }
  }, [aiTicket]);

  if (isLoading) return <SkeletonLoader />;
  if (!aiTicket) return null;

  // ── Dynamic fields from store ──
  const summary = aiTicket.summary || aiTicket.originalIssue || 'No issue text provided.';
  const category = aiTicket.category || 'Uncategorized';
  const subcategory = aiTicket.subcategory || 'None';
  const priority = aiTicket.priority || 'Medium';
  const assignedTeam = aiTicket.assigned_team || 'Triage';
  const entities = aiTicket.entities || [];
  const rawConfidence = aiTicket.confidence;
  const confidence = rawConfidence != null ? Math.round(rawConfidence * 100) : 95;

  let confBarColor = 'bg-red-500';
  if (confidence >= 90) confBarColor = 'bg-emerald-500';
  else if (confidence >= 70) confBarColor = 'bg-amber-500';

  const priorityLower = (priority || 'medium').toLowerCase();
  let priorityColor = 'bg-slate-100 text-slate-700';
  if (priorityLower === 'high' || priorityLower === 'critical')
    priorityColor = 'bg-red-50 text-red-700';
  else if (priorityLower === 'medium') priorityColor = 'bg-amber-50 text-amber-700';
  else if (priorityLower === 'low') priorityColor = 'bg-emerald-50 text-emerald-700';

  const handleUpdate = () => {
    setAITicket({ ...aiTicket, originalIssue: editedIssue });
  };

  const handleContinue = () => {
    setAITicket({ ...aiTicket, originalIssue: editedIssue, status: 'duplicate_check' });
    navigate('/knowledge-check');
  };

  // ── Pipeline stages ──
  const pipelineStages = [
    { label: 'Input', icon: FileText },
    { label: 'AI Analysis', icon: BrainCircuit },
    { label: 'Classification', icon: LayoutGrid },
    { label: 'Decision', icon: CheckCircle2 },
  ];
  const currentStage =
    aiTicket?.status === 'duplicate_check' ? 2 : aiTicket?.status === 'analyzing' ? 1 : 0;

  // ── Group entities by label ──
  const groupedEntities = entities.reduce((acc, entity) => {
    const label = entity.label || 'Other';
    if (!acc[label]) acc[label] = [];
    acc[label].push(entity.text);
    return acc;
  }, {});

  // ── Explainer data ──
  const signalTexts = entities.map((e) => e.text);
  const patternMatch = `${category} > ${subcategory}`;
  const safeCategory = String(category || 'General').toLowerCase();
  const safeSubcategory = String(subcategory || 'Support').toLowerCase();
  const confidenceExplanation =
    confidence >= 90
      ? `This issue strongly matches known ${safeCategory} ${safeSubcategory} failures.`
      : confidence >= 70
        ? `This issue partially matches patterns in ${safeCategory} issues.`
        : `This issue has a weak match; further review may be needed.`;

  return (
    <div className='min-h-screen bg-[#f6f8f7] pb-20 pt-32 px-6'>
      <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
      <div className='w-full max-w-[900px] mx-auto space-y-8'>
        {/* 1. Page Header */}
        <div className='mb-2 text-center'>
          <h1 className='text-3xl font-black text-gray-900 tracking-tight'>AI Analysis Complete</h1>
          <p className='text-gray-500 font-medium mt-2'>
            Our AI analyzed your request and identified the issue.
          </p>
        </div>

        {/* Horizontal Analysis Pipeline */}
        <div className='flex items-center justify-center gap-0 py-4'>
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStage;
            const isCurrent = idx === currentStage;

            return (
              <React.Fragment key={stage.label}>
                <div className='flex flex-col items-center gap-2 min-w-[90px]'>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                        : isCompleted
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                  </div>
                  <span
                    className={`text-xs font-bold tracking-tight ${
                      isCurrent
                        ? 'text-emerald-600'
                        : isCompleted
                          ? 'text-gray-700'
                          : 'text-gray-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
                {idx < pipelineStages.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 max-w-[60px] rounded-full mx-1 mt-[-20px] ${
                      idx < currentStage ? 'bg-emerald-400' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 2. Issue Summary Card */}
        <Card className='rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden'>
          <CardContent className='p-8 flex items-start gap-6'>
            <div className='w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center shrink-0'>
              <Bot className='w-7 h-7 text-emerald-600' />
            </div>
            <div className='flex-1'>
              <h2 className='text-xs font-black text-gray-400 uppercase tracking-widest mb-2'>
                AI Summary
              </h2>
              <p className='text-lg font-bold text-gray-900 leading-relaxed'>{summary}</p>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {/* 3. AI Classification Card */}
          <Card className='rounded-xl border border-gray-100 shadow-sm bg-white'>
            <CardContent className='p-8 space-y-6'>
              <h3 className='text-sm font-black text-gray-900 flex items-center gap-2'>
                <Layers className='w-4 h-4 text-emerald-500' />
                Classification
              </h3>

              <div className='space-y-4'>
                <div>
                  <p className='text-xs font-semibold text-gray-400 mb-1'>Category & Subcategory</p>
                  <div className='flex items-center gap-2'>
                    <span className='px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100'>
                      {category}
                    </span>
                    <span className='text-gray-300'>/</span>
                    <span className='text-sm font-medium text-gray-600'>{subcategory}</span>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 pt-2'>
                  <div>
                    <p className='text-xs font-semibold text-gray-400 mb-1'>Priority</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityColor}`}>
                      {priority}
                    </span>
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-gray-400 mb-1'>Assigned Team</p>
                    <span className='flex items-center gap-1.5 text-sm font-semibold text-gray-700'>
                      <ShieldCheck className='w-4 h-4 text-emerald-500' />
                      {assignedTeam}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Entities & 5. Confidence */}
          <div className='space-y-8'>
            {/* Entities Extracted — Grouped by Type */}
            <Card className='rounded-xl border border-gray-100 shadow-sm bg-white'>
              <CardContent className='p-8'>
                <h3 className='text-sm font-black text-gray-900 flex items-center gap-2 mb-5'>
                  <Zap className='w-4 h-4 text-amber-500' />
                  Technical Signals Detected
                </h3>
                {Object.keys(groupedEntities).length > 0 ? (
                  <div className='space-y-4'>
                    {Object.entries(groupedEntities).map(([label, texts]) => (
                      <div key={label}>
                        <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2'>
                          {label}
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {texts.map((t, idx) => (
                            <span
                              key={idx}
                              className='px-3 py-1 rounded-full bg-white border border-emerald-200 text-gray-700 text-xs font-bold flex items-center gap-1.5'
                            >
                              <Tag className='w-3 h-3 text-emerald-400' />
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className='text-sm text-gray-500 italic'>
                    No specific signals detected.
                  </span>
                )}

                {/* Technical Environment — User visible diagnostic */}
                {aiTicket.env_metadata && (
                  <div className='mt-6 p-4 rounded-xl border border-indigo-100 bg-indigo-50/30'>
                    <h4 className='text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5'>
                      <ShieldCheck className='w-3.5 h-3.5' />
                      Technical Environment
                    </h4>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-[10px] font-bold text-gray-500 uppercase tracking-wider'>
                          Interface IP
                        </span>
                        <span className='text-[10px] font-black text-indigo-600 font-mono italic'>
                          {aiTicket.env_metadata.ip || '127.0.0.1'}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-[10px] font-bold text-gray-500 uppercase tracking-wider'>
                          Device Signal
                        </span>
                        <span className='text-[10px] font-medium text-gray-500 truncate ml-4 italic'>
                          {aiTicket.env_metadata.user_agent
                            ? aiTicket.env_metadata.user_agent.split(' ').slice(0, 3).join(' ') +
                              '...'
                            : 'SECURE_NODE'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* OCR Screenshot Entities */}
                {aiTicket.ocrText && (
                  <div className='mt-6 p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50'>
                    <h4 className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5'>
                      <ImageIcon className='w-3.5 h-3.5' />
                      Detected from Screenshot
                    </h4>
                    <div className='flex flex-wrap gap-2'>
                      {aiTicket.ocrText
                        .split(/\n|,/)
                        .filter(Boolean)
                        .map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return null;
                          return (
                            <span
                              key={idx}
                              className='px-3 py-1 rounded-full bg-white border border-emerald-200 text-gray-700 text-sm font-bold'
                            >
                              {trimmed}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Confidence Meter */}
            <Card className='rounded-xl border border-gray-100 shadow-sm bg-white'>
              <CardContent className='p-8'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-sm font-black text-gray-900 flex items-center gap-2'>
                    <Activity className='w-4 h-4 text-blue-500' />
                    AI Confidence: {confidence}%
                  </h3>
                </div>
                <div className='w-full h-2.5 bg-gray-100 rounded-full overflow-hidden'>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${confBarColor}`}
                    style={{ width: `${confidence}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Collapsible: How AI reached this conclusion */}
        <Card className='rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden'>
          <button
            onClick={() => setExplainerOpen(!explainerOpen)}
            className='w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors'
          >
            <span className='text-sm font-black text-gray-900 flex items-center gap-2'>
              <Lightbulb className='w-4 h-4 text-amber-500' />
              How AI reached this conclusion
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${explainerOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${explainerOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <div className='px-6 pb-6 space-y-5 border-t border-gray-100 pt-5'>
              {/* Signals Detected */}
              <div>
                <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2'>
                  Signals Detected
                </p>
                <div className='flex flex-wrap gap-2'>
                  {signalTexts.length > 0 ? (
                    signalTexts.map((s, idx) => (
                      <span
                        key={idx}
                        className='px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold'
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className='text-sm text-gray-400 italic'>No specific signals</span>
                  )}
                </div>
              </div>

              {/* Pattern Matched */}
              <div>
                <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2'>
                  Pattern Matched
                </p>
                <div className='flex items-center gap-2'>
                  <span className='px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold text-gray-700'>
                    {patternMatch}
                  </span>
                </div>
              </div>

              {/* Confidence Explanation */}
              <div>
                <p className='text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2'>
                  Confidence Explanation
                </p>
                <p className='text-sm text-gray-600 font-medium leading-relaxed italic'>
                  "{confidenceExplanation}"
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* 6. User Correction Section */}
        <Card className='rounded-xl border border-gray-100 shadow-sm bg-white'>
          <CardContent className='p-8 space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-black text-gray-900 flex items-center gap-2'>
                <AlertCircle className='w-4 h-4 text-emerald-500' />
                Is something missing?
              </h3>
              <button
                onClick={handleUpdate}
                className='text-xs font-bold text-emerald-600 hover:text-emerald-700 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors'
              >
                Update Analysis
              </button>
            </div>
            <textarea
              value={editedIssue}
              onChange={(e) => setEditedIssue(e.target.value)}
              className='w-full min-h-[100px] p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-gray-700 resize-none transition-all'
              placeholder='Add or correct any details here...'
            />
          </CardContent>
        </Card>

        {/* 7. Continue Button */}
        <div className='flex justify-end pt-4'>
          <button
            onClick={handleContinue}
            className='h-14 px-10 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]'
          >
            Continue
            <ArrowRight className='w-5 h-5' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIUnderstanding;
