import React, { useState } from 'react';
import { ImageIcon, FileText, CheckCircle, Edit3, RefreshCw, ZoomIn, AlertCircle } from 'lucide-react';

const OCRVerification = ({ imageBase64, ocrText, onOCRUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(ocrText || '');
    const [zoomLevel, setZoomLevel] = useState(1);

    const handleSave = () => {
        if (onOCRUpdate) onOCRUpdate(editedText);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedText(ocrText || '');
        setIsEditing(false);
    };

    if (!imageBase64 && !ocrText) return null;

    const wordCount = (editedText || '').split(/\s+/).filter(Boolean).length;
    const charCount = (editedText || '').length;

    return (
        <div className="rounded-xl border border-gray-100 shadow-sm bg-white overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    OCR Verification
                </h3>
                <div className="flex items-center gap-2">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Verify Text
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCancel}
                                className="text-xs font-bold text-gray-500 hover:text-gray-700 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="text-xs font-bold text-white py-1.5 px-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1.5"
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Confirm
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-50">
                {imageBase64 && (
                    <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <ImageIcon className="w-3 h-3" />
                                Original Image
                            </span>
                            <button
                                onClick={() => setZoomLevel(z => Math.min(3, z + 0.5))}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center p-2">
                            <img
                                src={imageBase64}
                                alt="Uploaded screenshot"
                                className="max-w-full h-auto rounded-lg shadow-sm transition-transform duration-200"
                                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                                onWheel={(e) => {
                                    e.preventDefault();
                                    setZoomLevel(z => Math.max(0.5, Math.min(3, z - e.deltaY * 0.01)));
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center font-medium">
                            Scroll to zoom · {Math.round(zoomLevel * 100)}%
                        </p>
                    </div>
                )}

                <div className={`p-5 ${!imageBase64 ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FileText className="w-3 h-3" />
                            Extracted Text
                        </span>
                        {!isEditing && ocrText && (
                            <span className="text-[10px] font-bold text-gray-400">
                                {wordCount} words · {charCount} chars
                            </span>
                        )}
                    </div>

                    {isEditing ? (
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="w-full min-h-[200px] p-4 bg-white border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-gray-700 resize-none transition-all"
                            placeholder="Correct the extracted text here..."
                        />
                    ) : (
                        <div className="min-h-[200px] p-4 bg-gray-50 rounded-xl border border-gray-100">
                            {editedText ? (
                                <p className="text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {editedText}
                                </p>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <AlertCircle className="w-8 h-8 mb-2" />
                                    <p className="text-sm font-medium">No text was extracted from this image.</p>
                                    <p className="text-xs mt-1">You can manually type any visible text.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OCRVerification;
