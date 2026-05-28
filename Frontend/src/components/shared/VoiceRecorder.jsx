import React, { useState, useRef } from 'react';

const VoiceRecorder = ({ onTranscriptionComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Use webm, it compresses nicely and is widely supported by modern browsers
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = []; // Reset chunks

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) throw new Error('Transcription failed');
          const data = await response.json();
          if (data.transcribed_text && onTranscriptionComplete) {
             onTranscriptionComplete(data.transcribed_text);
          }
        } catch (error) {
          console.error("Voice processing error:", error);
          alert("Failed to transcribe audio.");
        } finally {
          setIsProcessing(false);
        }
      };

      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for voice input.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Release the microphone lock
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="voice-recorder p-4 border rounded-md my-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">{isRecording ? "🔴" : "🎤"}</span>
        <span className="text-sm text-gray-600 font-medium">
          {isRecording ? "Recording... Click stop to transcribe" : "Click to describe your issue with voice"}
        </span>
      </div>
      <button 
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`px-4 py-2 rounded-md font-bold text-white transition-colors ${
          isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isProcessing ? "Processing..." : isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default VoiceRecorder;
