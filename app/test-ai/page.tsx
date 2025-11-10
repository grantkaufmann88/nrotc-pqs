"use client";
import { useState } from "react";

export default function TestAIPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);

  const handleListen = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
      sendToAPI(transcript);
    };

    recognition.start();
  };

  const sendToAPI = async (spokenText) => {
    const res = await fetch("/api/test-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userAnswer: spokenText }),
    });
    const data = await res.json();
    setQuestion(data.question);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-3xl font-bold mb-4">NROTC PQS Board AI Test</h1>
      <button
        onClick={handleListen}
        className={`px-4 py-2 rounded ${
          listening ? "bg-red-500" : "bg-blue-600"
        } text-white`}
      >
        {listening ? "Listening..." : "Start Speaking"}
      </button>
      <p className="mt-4"><strong>Your Answer:</strong> {answer}</p>
      <p className="mt-2"><strong>AI Question:</strong> {question}</p>
    </div>
  );
}
