import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useVoiceRecognition – Custom hook for Web Speech API voice-to-text.
 *
 * Provides:
 *  - start / stop / toggle controls
 *  - live transcript + interim text
 *  - audio visualizer data (Uint8Array frequency bars)
 *  - browser-support detection
 *
 * @param {Object}  opts
 * @param {string}  [opts.lang='en-US']   BCP-47 language tag
 * @param {boolean} [opts.continuous=true]
 * @param {number}  [opts.visualizerBars=16]
 */
export default function useVoiceRecognition(opts = {}) {
    const {
        lang = 'en-US',
        continuous = true,
        visualizerBars = 16,
    } = opts;

    /* ── state ─────────────────────────────────────────── */
    const [isListening, setIsListening]       = useState(false);
    const [transcript, setTranscript]         = useState('');
    const [interim, setInterim]               = useState('');
    const [visualizerData, setVisualizerData] = useState(
        () => new Array(visualizerBars).fill(5)
    );
    const [error, setError]                   = useState(null);

    /* ── browser support ───────────────────────────────── */
    const isSupported =
        typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    /* ── refs ──────────────────────────────────────────── */
    const recognitionRef      = useRef(null);
    const audioContextRef     = useRef(null);
    const analyserRef         = useRef(null);
    const dataArrayRef        = useRef(null);
    const animFrameRef        = useRef(null);
    const streamRef           = useRef(null);
    const isListeningRef      = useRef(false); // synchronous mirror

    /* ── cleanup on unmount ────────────────────────────── */
    useEffect(() => {
        return () => {
            stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── visualizer loop ───────────────────────────────── */
    const runVisualizer = useCallback(() => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const bars = [];
        for (let i = 0; i < visualizerBars; i++) {
            const val = dataArrayRef.current[i] || 0;
            bars.push(Math.max(5, (val / 255) * 50));
        }
        setVisualizerData(bars);
        animFrameRef.current = requestAnimationFrame(runVisualizer);
    }, [visualizerBars]);

    /* ── start ─────────────────────────────────────────── */
    const start = useCallback(async () => {
        if (!isSupported) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        // Reset
        setTranscript('');
        setInterim('');
        setError(null);

        try {
            /* ---- microphone + analyser ---- */
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;

            const source   = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current  = analyser;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

            runVisualizer();

            /* ---- speech recognition ---- */
            const SpeechRecognition =
                window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous    = continuous;
            recognition.interimResults = true;
            recognition.lang          = lang;

            recognition.onresult = (event) => {
                let finalStr   = '';
                let interimStr = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalStr += event.results[i][0].transcript;
                    } else {
                        interimStr += event.results[i][0].transcript;
                    }
                }
                if (finalStr) {
                    setTranscript((prev) => (prev + ' ' + finalStr).trim());
                }
                setInterim(interimStr);
            };

            recognition.onerror = (event) => {
                if (event.error !== 'no-speech') {
                    setError(`Microphone error: ${event.error}`);
                }
            };

            recognition.onend = () => {
                // Auto-restart only if user still intends to listen
                if (isListeningRef.current && continuous) {
                    try { recognition.start(); } catch (_) { /* noop */ }
                }
            };

            recognitionRef.current = recognition;
            recognition.start();

            isListeningRef.current = true;
            setIsListening(true);
        } catch (err) {
            console.error('Microphone access denied:', err);
            setError('Could not access microphone. Please grant permission.');
        }
    }, [isSupported, continuous, lang, runVisualizer]);

    /* ── stop ──────────────────────────────────────────── */
    const stop = useCallback(() => {
        isListeningRef.current = false;
        setIsListening(false);

        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (_) { /* noop */ }
            recognitionRef.current = null;
        }
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    }, []);

    /* ── toggle ────────────────────────────────────────── */
    const toggle = useCallback(() => {
        isListeningRef.current ? stop() : start();
    }, [start, stop]);

    /* ── reset ─────────────────────────────────────────── */
    const reset = useCallback(() => {
        stop();
        setTranscript('');
        setInterim('');
        setError(null);
        setVisualizerData(new Array(visualizerBars).fill(5));
    }, [stop, visualizerBars]);

    return {
        // state
        isListening,
        transcript,
        interim,
        visualizerData,
        error,
        isSupported,
        // controls
        start,
        stop,
        toggle,
        reset,
        // setters (for manual manipulation)
        setTranscript,
        setInterim,
        setError,
    };
}
