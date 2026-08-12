import { useEffect, useRef, useState } from "react";

type RecognitionEvent = Event & { results: ArrayLike<{ 0: { transcript: string } }> };
type RecognitionError = Event & { error?: string };
type Recognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: RecognitionError) => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionConstructor = new () => Recognition;

export function usePikoVoice(onTranscript: (value: string) => void) {
  const recognition = useRef<Recognition | null>(null);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const supported = Boolean(recognitionApi());

  useEffect(() => () => recognition.current?.stop(), []);

  function toggle() {
    if (listening) return recognition.current?.stop();
    const Api = recognitionApi();
    if (!Api) return setError("Voice input needs Chrome or Edge with microphone access.");
    const instance = new Api();
    instance.continuous = false;
    instance.interimResults = true;
    instance.lang = navigator.language || "en-IN";
    instance.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript.trim())
        .filter(Boolean)
        .join(" ");
      onTranscript(transcript);
    };
    instance.onerror = (event) => {
      setError(event.error === "not-allowed" ? "Allow microphone access in browser site settings." : "Piko could not hear you. Please try again.");
      setListening(false);
    };
    instance.onend = () => {
      recognition.current = null;
      setListening(false);
    };
    recognition.current = instance;
    setError("");
    setListening(true);
    instance.start();
  }

  return { error, listening, supported, toggle };
}

function recognitionApi(): RecognitionConstructor | undefined {
  const candidate = window as typeof window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition;
}
