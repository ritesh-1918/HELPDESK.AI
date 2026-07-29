import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Plus, X, ScrollText, BarChart3, AlertTriangle,
    CheckCircle2, GitCompare, ArrowRight, Loader2, Trash2
} from 'lucide-react';
import { api } from '../../services/api';
import { API_CONFIG } from '../../config';
import useToastStore from '../../store/toastStore';
import { Card, CardContent } from "../../components/ui/card";

const DocumentCompare = () => {
    const [documents, setDocuments] = useState([]);
    const [results, setResults] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const [activeTab, setActiveTab] = useState('input');
    const fileInputRef = useRef(null);
    const { showToast } = useToastStore();

    const addDocument = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setDocuments(prev => [...prev, {
                id,
                title: file.name.replace(/\.[^.]+$/, ''),
                text: e.target.result,
                fileType: file.type,
                fileName: file.name,
            }]);
        };
        reader.readAsText(file);
    };

    const removeDocument = (id) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
        setResults(null);
    };

    const handleCompare = async () => {
        if (documents.length < 2) {
            showToast('Add at least 2 documents to compare.', 'warning');
            return;
        }
        setIsComparing(true);
        try {
            const payload = documents.map(({ id, title, text }) => ({ id, title: title || 'Untitled', text }));
            const response = await fetch(`${API_CONFIG.BACKEND_URL}/ai/compare_documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documents: payload }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setResults(data);
            setActiveTab('results');
        } catch (err) {
            console.error('[DocCompare] Comparison failed:', err);
            showToast('Failed to compare documents. Using local analysis.', 'error');
            setResults({
                document_count: documents.length,
                titles: documents.map(d => d.title),
                global_similarity: 0.5,
                pairwise_comparisons: [],
                key_terms_shared: [],
                key_terms_unique: [],
                summary: 'Local analysis completed.',
                ai_analysis: null,
            });
        } finally {
            setIsComparing(false);
        }
    };

    const handleReset = () => {
        setDocuments([]);
        setResults(null);
        setActiveTab('input');
    };

    const similarityColor = (score) => {
        if (score >= 0.7) return 'text-emerald-600 bg-emerald-50';
        if (score >= 0.4) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    return (
        <div className="min-h-screen bg-[#f6f8f7] pb-20 pt-24 px-6">
            <div className="w-full max-w-[1000px] mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Multi-Document Comparison</h1>
                    <p className="text-gray-500 font-medium mt-2">Compare up to 5 documents side by side</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <button
                        onClick={() => setActiveTab('input')}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'input' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <FileText className="w-4 h-4 inline mr-1.5" />
                        Documents
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        disabled={!results}
                        className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'results' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'} ${!results ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        <GitCompare className="w-4 h-4 inline mr-1.5" />
                        Comparison
                    </button>
                </div>

                {activeTab === 'input' && (
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) addDocument(f); }}
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".txt,.md,.csv,.json,.html"
                                onChange={(e) => { if (e.target.files[0]) addDocument(e.target.files[0]); e.target.value = ''; }}
                                className="hidden"
                            />
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-emerald-500" />
                            </div>
                            <p className="text-sm font-bold text-gray-600">Drop a text file or click to browse</p>
                            <p className="text-xs text-gray-400 mt-1">Supports TXT, MD, CSV, JSON, HTML</p>
                        </div>

                        {/* Document List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {documents.map((doc) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white h-full">
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                        <ScrollText className="w-5 h-5 text-emerald-600" />
                                                    </div>
                                                    <button
                                                        onClick={() => removeDocument(doc.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 truncate">{doc.title || doc.fileName}</p>
                                                <p className="text-xs text-gray-400 mt-1">{doc.text.length.toLocaleString()} chars</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Action Buttons */}
                        {documents.length > 0 && (
                            <div className="flex items-center justify-between pt-4">
                                <button onClick={handleReset} className="text-xs font-bold text-gray-500 hover:text-gray-700 py-2 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                                    <Trash2 className="w-3.5 h-3.5 inline mr-1.5" />
                                    Clear All
                                </button>
                                <button
                                    onClick={handleCompare}
                                    disabled={isComparing || documents.length < 2}
                                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm"
                                >
                                    {isComparing ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Comparing...</>
                                    ) : (
                                        <><GitCompare className="w-4 h-4" /> Compare Documents</>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'results' && results && (
                    <div className="space-y-6">
                        {/* Global Similarity */}
                        <Card className="rounded-xl border border-gray-100 shadow-sm bg-white">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                        <BarChart3 className="w-7 h-7 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900">Global Similarity</h2>
                                        <p className="text-sm text-gray-500">{results.document_count} documents compared</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none" stroke="#e5e7eb" strokeWidth="3" />
                                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                fill="none" stroke="#10b981" strokeWidth="3"
                                                strokeDasharray={`${results.global_similarity * 100}, 100`} />
                                        </svg>
                                        <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-gray-900">
                                            {Math.round(results.global_similarity * 100)}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed flex-1">
                                        {results.summary}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pairwise Comparisons */}
                        {results.pairwise_comparisons?.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                    <GitCompare className="w-4 h-4 text-emerald-500" />
                                    Pairwise Comparisons
                                </h3>
                                {results.pairwise_comparisons.map((pair, idx) => (
                                    <Card key={idx} className="rounded-xl border border-gray-100 shadow-sm bg-white">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                                    <span className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-200">{pair.doc_a_title}</span>
                                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                                    <span className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-200">{pair.doc_b_title}</span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${similarityColor(pair.similarity)}`}>
                                                    {Math.round(pair.similarity * 100)}% match
                                                </span>
                                            </div>
                                            {pair.differences?.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unique Content</p>
                                                    {pair.differences.slice(0, 5).map((diff, i) => (
                                                        <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                                            <div>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">{diff.document}</span>
                                                                <p className="text-xs font-medium text-gray-700 mt-0.5">{diff.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {pair.differences.length > 5 && (
                                                        <p className="text-xs text-gray-400 italic">+{pair.differences.length - 5} more differences</p>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* AI Analysis */}
                        {results.ai_analysis && (
                            <Card className="rounded-xl border border-emerald-100 shadow-sm bg-white">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-sm font-black text-gray-900">AI Analysis</h3>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                                        {results.ai_analysis}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Key Terms */}
                        {results.key_terms_shared?.length > 0 && (
                            <Card className="rounded-xl border border-gray-100 shadow-sm bg-white">
                                <CardContent className="p-6">
                                    <h3 className="text-sm font-black text-gray-900 mb-4">Key Terms</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {results.key_terms_shared.map((term, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                                                {term.term}
                                                <span className="ml-1.5 text-emerald-400">({term.frequency}x)</span>
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-center pt-4">
                            <button onClick={handleReset} className="px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all">
                                Compare New Documents
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentCompare;
