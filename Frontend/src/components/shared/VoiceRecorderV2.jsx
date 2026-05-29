/**
 * VoiceRecorderV2.jsx
 *
 * Enhanced voice-to-ticket recorder component (Issue #207).
 *
 * Features:
 *  - Dark card with green (#10b981) accent
 *  - Animated waveform bars during recording (CSS keyframes via inline styles)
 *  - 120-second countdown timer (enforces MAX_AUDIO_SECONDS limit)
 *  - State machine: idle → recording → processing → done → error
 *  - Uses MediaRecorder API with multi-format MIME fallback
 *  - POSTs to /api/voice/transcribe endpoint
 *  - Shows transcription in an editable textarea
 *  - Calls props.onTranscription(text) when transcription is received
 *
 * Props:
 *  onTranscription {function(text: string)} — called with the final transcript
 *  maxSeconds      {number}                 — optional; defaults to 120
 *  placeholder     {string}                 — optional textarea placeholder
 *
 * No external icon library required — all icons are inline SVG.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_SECONDS = 120;

const MIME_PRIORITY = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

function getSupportedMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  return MIME_PRIORITY.find(m => MediaRecorder.isTypeSupported(m)) || '';
}

// ─── Inline styles for animated waveform ─────────────────────────────────────

const waveKeyframes = `
@keyframes wave-bounce {
  0%, 100% { transform: scaleY(0.3); }
  50%       { transform: scaleY(1); }
}
`;

function WaveBar({ delay }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 4,
        height: 24,
        margin: '0 2px',
        borderRadius: 2,
        background: '#10b981',
        animation: `wave-bounce 0.9s ease-in-out ${delay}s infinite`,
        transformOrigin: 'bottom',
      }}
    />
  );
}

function Waveform() {
  const delays = [0, 0.15, 0.3, 0.45, 0.6, 0.45, 0.3, 0.15, 0];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {delays.map((d, i) => <WaveBar key={i} delay={d} />)}
    </span>
  );
}

// ─── Small SVG icons ──────────────────────────────────────────────────────────

function MicIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
    </svg>
  );
}

function StopIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function CheckIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SpinnerIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
      <path fill="currentColor" opacity="0.75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function RefreshIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

// ─── Countdown timer display ──────────────────────────────────────────────────

function CountdownBar({ seconds, maxSeconds }) {
  const pct = Math.max(0, (seconds / maxSeconds) * 100);
  const colour = seconds <= 10 ? '#ef4444' : seconds <= 30 ? '#f59e0b' : '#10b981';
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12, color: '#9ca3af', marginBottom: 4,
      }}>
        <span>Time remaining</span>
        <span style={{ color: colour, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
          {mm}:{ss}
        </span>
      </div>
      <div style={{ height: 4, background: '#374151', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: colour,
          borderRadius: 9999, transition: 'width 1s linear, background-color 0.5s',
        }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VoiceRecorderV2({
  onTranscription,
  maxSeconds = MAX_SECONDS,
  placeholder = 'Transcription will appear here. You can edit it before submitting.',
}) {
  const [state, setState] = useState('idle'); // idle | recording | processing | done | error
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(maxSeconds);

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const timerRef         = useRef(null);

  // ── Timer management ─────────────────────────────────────────────────────

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((onExpire) => {
    setCountdown(maxSeconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearTimer();
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [maxSeconds, clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  // ── Stop and process audio ───────────────────────────────────────────────

  const processAudio = useCallback(async (chunks, mimeType) => {
    setState('processing');
    const audioBlob = new Blob(chunks, { type: mimeType || 'audio/webm' });
    const formData  = new FormData();
    formData.append('audio', audioBlob, `recording.${mimeType?.includes('mp4') ? 'mp4' : 'webm'}`);

    try {
      const res = await fetch('/api/voice/transcribe', { method: 'POST', body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const text = (data.transcribed_text || '').trim();
      setTranscript(text);
      setState('done');
      if (text && typeof onTranscription === 'function') {
        onTranscription(text);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Transcription failed. Please try again.');
      setState('error');
    }
  }, [onTranscription]);

  // ── Start recording ──────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    setErrorMsg('');
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime   = getSupportedMime();
      const options = mime ? { mimeType: mime } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data?.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        // Release mic
        stream.getTracks().forEach(t => t.stop());
        processAudio(chunksRef.current, recorder.mimeType);
      };

      recorder.start(250); // collect every 250 ms
      setState('recording');
      startTimer(() => stopRecording());
    } catch (_err) {
      setErrorMsg('Microphone access denied. Please allow microphone permission.');
      setState('error');
    }
  }, [processAudio, startTimer]);

  // ── Stop recording ───────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    clearTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setState('processing');
  }, [clearTimer]);

  // ── Reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    clearTimer();
    setTranscript('');
    setErrorMsg('');
    setCountdown(maxSeconds);
    setState('idle');
  }, [clearTimer, maxSeconds]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const isRecording   = state === 'recording';
  const isProcessing  = state === 'processing';
  const isDone        = state === 'done';
  const isError       = state === 'error';
  const isIdle        = state === 'idle';

  return (
    <>
      {/* Inject waveform keyframe animation */}
      <style>{waveKeyframes}</style>

      <div style={{
        background: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 16,
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#f9fafb',
        maxWidth: 520,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(16,185,129,0.1)', color: '#10b981',
          }}>
            <MicIcon size={20} />
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Voice-to-Ticket</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              Speak your issue — AI transcribes it automatically
            </div>
          </div>

          {/* Reset button (top-right when not idle) */}
          {!isIdle && (
            <button onClick={reset} title="Start over" style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 8,
              background: 'transparent', border: '1px solid #374151',
              color: '#9ca3af', fontSize: 12, cursor: 'pointer',
            }}>
              <RefreshIcon size={13} /> Reset
            </button>
          )}
        </div>

        {/* ── State: idle ── */}
        {isIdle && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>
              Press the button below and describe your support issue clearly.
              Recording stops automatically after {maxSeconds} seconds.
            </p>
            <button
              onClick={startRecording}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '12px 28px', borderRadius: 12,
                background: '#10b981', color: '#fff', border: 'none',
                fontWeight: 700, fontSize: 15, cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
                transition: 'transform 0.1s',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <MicIcon size={18} /> Start Recording
            </button>
          </div>
        )}

        {/* ── State: recording ── */}
        {isRecording && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Waveform + status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
              borderRadius: 10, padding: '12px 16px',
            }}>
              <Waveform />
              <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                Listening… speak clearly
              </span>
            </div>

            {/* Countdown */}
            <CountdownBar seconds={countdown} maxSeconds={maxSeconds} />

            {/* Stop button */}
            <button
              onClick={stopRecording}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 24px', borderRadius: 12,
                background: '#ef4444', color: '#fff', border: 'none',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                alignSelf: 'flex-start',
                boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
              }}
            >
              <StopIcon size={16} /> Stop Recording
            </button>
          </div>
        )}

        {/* ── State: processing ── */}
        {isProcessing && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
            <SpinnerIcon size={28} />
            <p style={{ marginTop: 12, fontSize: 14 }}>
              Transcribing your audio with Whisper AI…
            </p>
          </div>
        )}

        {/* ── State: done ── */}
        {isDone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
              color: '#10b981', fontWeight: 600,
            }}>
              <CheckIcon size={16} /> Transcription complete — edit if needed
            </div>
            <textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              rows={5}
              placeholder={placeholder}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '12px 14px', borderRadius: 10,
                background: '#1f2937', border: '1px solid #374151',
                color: '#f9fafb', fontSize: 14, lineHeight: 1.6,
                resize: 'vertical', outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = '#10b981'}
              onBlur={e => e.target.style.borderColor = '#374151'}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => typeof onTranscription === 'function' && onTranscription(transcript)}
                style={{
                  padding: '10px 20px', borderRadius: 10,
                  background: '#10b981', color: '#fff', border: 'none',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                Use This Text
              </button>
              <button onClick={startRecording} style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'transparent', border: '1px solid #374151',
                color: '#9ca3af', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>
                Re-record
              </button>
            </div>
          </div>
        )}

        {/* ── State: error ── */}
        {isError && (
          <div style={{
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <p style={{ color: '#fca5a5', fontSize: 13, margin: 0 }}>
              ⚠ {errorMsg || 'Something went wrong. Please try again.'}
            </p>
            <button onClick={reset} style={{
              alignSelf: 'flex-start', padding: '8px 16px', borderRadius: 8,
              background: '#374151', color: '#f9fafb', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Try Again
            </button>
          </div>
        )}

        {/* Footer tip */}
        <p style={{ marginTop: 16, fontSize: 11, color: '#4b5563', lineHeight: 1.5 }}>
          Supported formats: WAV, WebM, MP3, OGG, MP4, M4A · Max {maxSeconds}s · 25 MB limit
        </p>
      </div>
    </>
  );
}
