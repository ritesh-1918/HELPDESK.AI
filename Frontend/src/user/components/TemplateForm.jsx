import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

/**
 * TemplateForm — Dynamically renders form fields based on a template's `fields` array.
 *
 * ARCHITECTURE:
 * This component is the core of the structured template system. Instead of dumping
 * a markdown blob into a textarea, it renders proper form inputs (text, textarea,
 * select, date, checkbox) that guide the user through structured data entry.
 *
 * At submit time, the parent component calls `serializeFieldsToText()` from
 * ticketTemplates.js to convert the structured data back into formatted text
 * for backend API compatibility.
 *
 * Props:
 *   fields        - Array of field definitions from the template
 *   values        - Object of current field values keyed by field.key
 *   onChange      - Callback(key, value) when any field value changes
 *   disabled      - Whether to disable all fields (during submission)
 *   accentColor   - CSS color class prefix for styling (e.g., 'emerald')
 */
const TemplateForm = ({ fields, values, onChange, disabled = false, accentColor = 'emerald' }) => {
    if (!fields || fields.length === 0) return null;

    // Staggered animation for field entries
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    };

    // Shared input style classes
    const inputBase = `w-full rounded-xl border bg-gray-50/50 focus:bg-white transition-all text-sm px-4 py-3 outline-none
        border-gray-100 focus:border-${accentColor}-300 focus:ring-2 focus:ring-${accentColor}-100
        disabled:opacity-50 disabled:cursor-not-allowed`;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
        >
            {fields.map((field) => {
                const value = values[field.key] ?? (field.type === 'checkbox' ? false : '');

                return (
                    <motion.div key={field.key} variants={itemVariants} className="space-y-1.5">
                        {/* Field label */}
                        {field.type !== 'checkbox' && (
                            <label
                                htmlFor={`tpl-${field.key}`}
                                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"
                            >
                                {field.label}
                                {field.required && (
                                    <span className="text-red-400 text-xs">*</span>
                                )}
                            </label>
                        )}

                        {/* ── Text input ── */}
                        {field.type === 'text' && (
                            <input
                                id={`tpl-${field.key}`}
                                type="text"
                                value={value}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                placeholder={field.placeholder || ''}
                                disabled={disabled}
                                className={inputBase}
                            />
                        )}

                        {/* ── Textarea ── */}
                        {field.type === 'textarea' && (
                            <textarea
                                id={`tpl-${field.key}`}
                                value={value}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                placeholder={field.placeholder || ''}
                                disabled={disabled}
                                rows={3}
                                className={`${inputBase} resize-none`}
                            />
                        )}

                        {/* ── Select dropdown ── */}
                        {field.type === 'select' && (
                            <select
                                id={`tpl-${field.key}`}
                                value={value}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                disabled={disabled}
                                className={`${inputBase} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`}
                            >
                                <option value="">Select {field.label.toLowerCase()}...</option>
                                {(field.options || []).map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}

                        {/* ── Date picker ── */}
                        {field.type === 'date' && (
                            <input
                                id={`tpl-${field.key}`}
                                type="date"
                                value={value}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                disabled={disabled}
                                className={`${inputBase} cursor-pointer`}
                            />
                        )}

                        {/* ── Checkbox ── */}
                        {field.type === 'checkbox' && (
                            <label
                                htmlFor={`tpl-${field.key}`}
                                className="flex items-center gap-3 cursor-pointer group py-1"
                            >
                                <input
                                    id={`tpl-${field.key}`}
                                    type="checkbox"
                                    checked={!!value}
                                    onChange={(e) => onChange(field.key, e.target.checked)}
                                    disabled={disabled}
                                    className={`w-5 h-5 rounded border-gray-300 text-${accentColor}-600 focus:ring-${accentColor}-500 transition-all cursor-pointer`}
                                />
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                                    {field.label}
                                </span>
                            </label>
                        )}
                    </motion.div>
                );
            })}

            {/* Required fields hint */}
            <div className="flex items-center gap-1.5 pt-1">
                <AlertCircle size={12} className="text-gray-300" />
                <span className="text-[11px] text-gray-400 font-medium">
                    Fields marked with <span className="text-red-400">*</span> are required
                </span>
            </div>
        </motion.div>
    );
};

export default TemplateForm;
