import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldOff,
    KeyRound,
    MailX,
    Printer,
    WifiOff,
    Download,
    X,
    Check,
    Sparkles,
    FileText,
    ArrowRight,
} from 'lucide-react';
import TICKET_TEMPLATES from '../../data/ticketTemplates';

/**
 * Maps icon name strings from the template data to actual lucide-react components.
 */
const ICON_MAP = {
    ShieldOff,
    KeyRound,
    MailX,
    Printer,
    WifiOff,
    Download,
};

/**
 * Color palette for template cards — each template gets a distinct, harmonious color.
 */
const CARD_COLORS = {
    'vpn-connectivity': {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        activeBorder: 'border-amber-400',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        buttonBg: 'bg-amber-500 hover:bg-amber-600',
        previewBg: 'bg-amber-50/50',
        previewBorder: 'border-amber-200',
    },
    'password-reset': {
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        activeBorder: 'border-violet-400',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
        badge: 'bg-violet-100 text-violet-700',
        buttonBg: 'bg-violet-500 hover:bg-violet-600',
        previewBg: 'bg-violet-50/50',
        previewBorder: 'border-violet-200',
    },
    'email-access': {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        activeBorder: 'border-blue-400',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
        buttonBg: 'bg-blue-500 hover:bg-blue-600',
        previewBg: 'bg-blue-50/50',
        previewBorder: 'border-blue-200',
    },
    'printer-issue': {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        activeBorder: 'border-rose-400',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600',
        badge: 'bg-rose-100 text-rose-700',
        buttonBg: 'bg-rose-500 hover:bg-rose-600',
        previewBg: 'bg-rose-50/50',
        previewBorder: 'border-rose-200',
    },
    'wifi-network': {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        activeBorder: 'border-emerald-400',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700',
        buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
        previewBg: 'bg-emerald-50/50',
        previewBorder: 'border-emerald-200',
    },
    'software-installation': {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        activeBorder: 'border-indigo-400',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        badge: 'bg-indigo-100 text-indigo-700',
        buttonBg: 'bg-indigo-500 hover:bg-indigo-600',
        previewBg: 'bg-indigo-50/50',
        previewBorder: 'border-indigo-200',
    },
};

/**
 * TemplateSelector v2 — Two-step template selection with preview.
 *
 * UX FLOW (v2 change):
 *   1. User clicks a template card → card is HIGHLIGHTED (not auto-applied)
 *   2. A preview panel appears showing template details + field count
 *   3. User clicks "Use This Template" → onActivateTemplate is called
 *   4. Only THEN does the dynamic form appear in CreateTicket
 *
 * Props:
 *   selectedTemplateId   — currently highlighted template ID (or null)
 *   activatedTemplateId  — template that has been activated/committed (or null)
 *   onHighlightTemplate  — callback(templateObject) when a card is clicked (highlight only)
 *   onActivateTemplate   — callback(templateObject) when "Use Template" is confirmed
 *   onDismissTemplate    — callback() when the active template is dismissed
 *   hasExistingContent   — boolean, whether user has already typed content in the form
 */
const TemplateSelector = ({
    selectedTemplateId,
    activatedTemplateId,
    onHighlightTemplate,
    onActivateTemplate,
    onDismissTemplate,
    hasExistingContent = false,
}) => {
    const highlightedTemplate = TICKET_TEMPLATES.find((t) => t.id === selectedTemplateId);
    const isActivated = !!activatedTemplateId;

    return (
        <div className="space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-100 text-emerald-600 rounded-md">
                    <Sparkles size={14} className="fill-emerald-600" />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Start from a template
                </span>
                <span className="text-xs text-gray-300 font-medium">(optional)</span>
            </div>

            {/* Active template chip — shown when a template is activated */}
            <AnimatePresence>
                {isActivated && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1.5">
                                <Check size={12} className="text-emerald-600" strokeWidth={3} />
                                <span className="text-xs font-bold text-emerald-700">
                                    Using: {TICKET_TEMPLATES.find(t => t.id === activatedTemplateId)?.label}
                                </span>
                                <button
                                    type="button"
                                    onClick={onDismissTemplate}
                                    className="ml-1 p-0.5 rounded-full text-emerald-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    aria-label="Dismiss template"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Template cards grid — hidden when a template is activated */}
            {!isActivated && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {TICKET_TEMPLATES.map((template) => {
                            const IconComponent = ICON_MAP[template.icon];
                            const colors = CARD_COLORS[template.id];
                            const isHighlighted = selectedTemplateId === template.id;

                            return (
                                <motion.button
                                    key={template.id}
                                    type="button"
                                    onClick={() => onHighlightTemplate(template)}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`
                                        relative group text-left p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                                        ${isHighlighted
                                            ? `${colors.bg} ${colors.activeBorder} shadow-md`
                                            : `bg-white border-gray-100 hover:${colors.bg} hover:border-gray-200 shadow-sm hover:shadow-md`
                                        }
                                    `}
                                >
                                    {/* Selected checkmark */}
                                    <AnimatePresence>
                                        {isHighlighted && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm"
                                            >
                                                <Check size={12} className="text-white" strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Icon */}
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition-colors
                                            ${isHighlighted ? colors.iconBg : 'bg-gray-50 group-hover:' + colors.iconBg}
                                        `}
                                    >
                                        {IconComponent && (
                                            <IconComponent
                                                size={18}
                                                className={`transition-colors ${isHighlighted ? colors.iconColor : 'text-gray-400 group-hover:' + colors.iconColor}`}
                                            />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <p className="text-sm font-semibold text-gray-800 leading-tight mb-1.5">
                                        {template.label}
                                    </p>

                                    {/* Category badge */}
                                    <span
                                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                                            ${isHighlighted ? colors.badge : 'bg-gray-100 text-gray-500'}
                                        `}
                                    >
                                        {template.category}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* ── Template Preview Panel ── */}
                    {/* Appears when a card is highlighted but NOT yet activated */}
                    <AnimatePresence>
                        {highlightedTemplate && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: -10, height: 0 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="overflow-hidden"
                            >
                                <div
                                    className={`rounded-2xl border p-5 space-y-4
                                        ${CARD_COLORS[highlightedTemplate.id]?.previewBg || 'bg-gray-50'}
                                        ${CARD_COLORS[highlightedTemplate.id]?.previewBorder || 'border-gray-200'}
                                    `}
                                >
                                    {/* Preview header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CARD_COLORS[highlightedTemplate.id]?.iconBg}`}>
                                                {ICON_MAP[highlightedTemplate.icon] &&
                                                    React.createElement(ICON_MAP[highlightedTemplate.icon], {
                                                        size: 20,
                                                        className: CARD_COLORS[highlightedTemplate.id]?.iconColor,
                                                    })
                                                }
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{highlightedTemplate.label}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">{highlightedTemplate.description_summary}</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onHighlightTemplate(null)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
                                            aria-label="Close preview"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    {/* Field preview list */}
                                    <div className="space-y-1.5">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                            Form fields ({highlightedTemplate.fields?.length || 0})
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(highlightedTemplate.fields || []).map((field) => (
                                                <span
                                                    key={field.key}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-white/80 border border-gray-100 rounded-lg px-2.5 py-1"
                                                >
                                                    <FileText size={10} className="text-gray-400" />
                                                    {field.label}
                                                    {field.required && <span className="text-red-400">*</span>}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Existing content warning */}
                                    {hasExistingContent && (
                                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                            <span className="text-amber-500 mt-0.5 shrink-0">⚠️</span>
                                            <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                                You already have content in the form. Using this template will <strong>replace</strong> your current input.
                                            </p>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex items-center gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => onActivateTemplate(highlightedTemplate)}
                                            className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white rounded-xl px-5 py-3 transition-all shadow-sm hover:shadow-md active:scale-[0.98]
                                                ${CARD_COLORS[highlightedTemplate.id]?.buttonBg || 'bg-emerald-500 hover:bg-emerald-600'}
                                            `}
                                        >
                                            Use This Template
                                            <ArrowRight size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onHighlightTemplate(null)}
                                            className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-4 py-3 rounded-xl hover:bg-white/60 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-gray-100"></div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                    {isActivated ? 'fill in the details below' : 'or fill manually'}
                </span>
                <div className="flex-1 h-px bg-gray-100"></div>
            </div>
        </div>
    );
};

export default TemplateSelector;
