import React, { useState, useCallback } from 'react';
import { Mic, Loader2, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, className = "" }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Speech recognition not supported');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied');
      } else {
        setError('Error: ' + event.error);
      }
      setIsListening(false);
      setTimeout(() => setError(null), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition', e);
      setIsListening(false);
    }
  }, [onResult]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={startListening}
        disabled={isListening}
        className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center relative ${
          isListening 
            ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-1' 
            : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-amber-800'
        } disabled:opacity-75 disabled:cursor-not-allowed`}
        title={isListening ? 'Listening...' : 'Voice Input'}
      >
        {isListening ? (
          <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {isListening && (
           <span className="absolute -top-1 -right-1 flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
           </span>
        )}
      </button>
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500 whitespace-nowrap animate-in fade-in slide-in-from-left-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
