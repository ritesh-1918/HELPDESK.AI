import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2, X, Check, AlertCircle, Clock, Languages } from 'lucide-react';

/**
 * VoiceRecorder — Reusable voice-to-text component for HELPDESK.AI
 *
 * Features:
 * - Browser-native MediaRecorder for audio capture
 * - Server-side Whisper transcription via /api/voice/transcribe
 * - Real-time recording duration display
 * - Audio level visualization (Siri-style wave bars)
 * - Language hint support for better transcription accuracy
 * - Graceful error handling with user-friendly messages
 * - Accessible — keyboard navigable, screen-reader labels
 *
 * Props:
 * @param {(text: string) => void} onTranscriptionComplete - Called with the transcribed text
 * @param {string} [language] - Optional ISO-639-1 language hint (e.g. "en", "es")
 * @param {boolean} [disabled] - Disable the recorder
 * @param {string} [className] - Additional CSS classes
 * @param {number} [maxDurationSeconds=120] - Maximum recording duration in seconds
 *
 * Issue #207: Voice-to-Ticket Feature
 */
const VoiceRecorder = ({
    onTranscriptionComplete,
    language,
    disabled = false,
    className = '',
    maxDurationSeconds = 120,
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcript, setTranscript] = useState('');
    const [visualizerData, setVisualizerData] = useState(new Array(12).fill(4));

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    const formatTime = useCallback((seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }, []);

    const startVisualizer = useCallback((stream) => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            source.connect(analyser);
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            dataArrayRef.current = dataArray;

            const update = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArrayRef.current);
                const bars = [];
                for (let i = 0; i < 12; i++) {
                    const val = dataArrayRef.current[i] || 0;
                    bars.push(Math.max(4, (val / 255) * 40));
                }
                setVisualizerData(bars);
                animationFrameRef.current = requestAnimationFrame(update);
            };
            update();
        } catch {
            // Visualizer is non-fatal; continue without it
        }
    }, []);

    const startRecording = async () => {
        setError(null);
        setTranscript('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Pick the best supported MIME type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/ogg';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());

                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                audioChunksRef.current = [];

                if (audioBlob.size === 0) {
                    setError('No audio was recorded. Please try again.');
                    setIsRecording(false);
                    return;
                }

                setIsProcessing(true);
                try {
                    const formData = new FormData();
                    const ext = mimeType.includes('webm') ? 'webm' : 'ogg';
                    formData.append('audio', audioBlob, `recording.${ext}`);
                    if (language) {
                        formData.append('language', language);
                    }

                    const response = await fetch('/api/voice/transcribe', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        throw new Error(errData.detail || `Server error (${response.status})`);
                    }

                    const data = await response.json();
                    const text = (data.transcribed_text || '').trim();

                    if (!text) {
                        setError('No speech detected. Please speak clearly and try again.');
                        return;
                    }

                    setTranscript(text);
                    if (onTranscriptionComplete) {
                        onTranscriptionComplete(text);
                    }
                } catch (err) {
                    console.error('Voice transcription error:', err);
                    setError(err.message || 'Failed to transcribe audio. Please try again.');
                } finally {
                    setIsProcessing(false);
                }
            };

            recorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            setRecordingTime(0);
            startVisualizer(stream);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    if (prev + 1 >= maxDurationSeconds) {
                        stopRecording();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (err) {
            console.error('Microphone access error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please allow microphone permissions and try again.');
            } else if (err.name === 'NotFoundError') {
                setError('No microphone detected. Please connect a microphone and try again.');
            } else {
                setError(`Could not access microphone: ${err.message}`);
            }
        }
    };

    const stopRecording = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setVisualizerData(new Array(12).fill(4));
    };

    const handleToggle = () => {
        if (disabled || isProcessing) return;
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const clearError = () => setError(null);

    return (
        <div className={`voice-recorder ${className}`}>
            {/* Main control row */}
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md transition-shadow">
                {/* Record / Stop button */}
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={disabled || isProcessing}
                    aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                    className={`
                        relative flex items-center justify-center w-12 h-12 rounded-full
                        transition-all duration-300 font-semibold text-white shadow-lg
                        ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200 animate-pulse'
                            : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'
                        }
                        ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    {isProcessing ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : isRecording ? (
                        <MicOff size={20} />
                    ) : (
                        <Mic size={20} />
                    )}
                    {isRecording && (
                        <span className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping opacity-75" />
                    )}
                </button>

                {/* Status area */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                            {isProcessing
                                ? 'Transcribing audio...'
                                : isRecording
                                    ? 'Recording...'
                                    : 'Voice Input'}
                        </span>
                        {isRecording && (
                            <span className="flex items-center gap-1 text-xs font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                <Clock size={10} />
                                {formatTime(recordingTime)}
                            </span>
                        )}
                        {language && language !== 'en' && !isRecording && !isProcessing && (
                            <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                <Languages size={10} />
                                {language.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {isProcessing
                            ? 'Please wait while we convert your speech to text...'
                            : isRecording
                                ? 'Speak now. Click stop when finished.'
                                : 'Click the microphone to describe your issue by voice.'}
                    </p>
                </div>

                {/* Duration badge */}
                {!isRecording && !isProcessing && (
                    <span className="text-xs text-gray-400 font-medium hidden sm:block">
                        Max {formatTime(maxDurationSeconds)}
                    </span>
                )}
            </div>

            {/* Audio visualizer (shown while recording) */}
            {isRecording && (
                <div className="flex items-center justify-center gap-1 mt-3 py-3 px-4 bg-red-50/50 rounded-xl border border-red-100">
                    {visualizerData.map((height, i) => (
                        <div
                            key={i}
                            className="w-1.5 rounded-full bg-red-400 transition-all duration-75"
                            style={{ height: `${height}px` }}
                        />
                    ))}
                </div>
            )}

            {/* Transcript preview (shown after successful transcription) */}
            {transcript && !isRecording && !isProcessing && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                    <Check size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-700 mb-1">Transcription complete</p>
                        <p className="text-sm text-emerald-900 line-clamp-3">{transcript}</p>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                    <button
                        type="button"
                        onClick={clearError}
                        className="text-red-400 hover:text-red-600 shrink-0"
                        aria-label="Dismiss error"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
