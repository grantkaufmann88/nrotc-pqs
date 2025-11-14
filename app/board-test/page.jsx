"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function BoardTest() {
  const { data: session, status } = useSession();
  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [pqsId, setPqsId] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correct, setCorrect] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const loopRef = useRef(false);
  

  const lastName = session?.user?.lastName || "X";

  // Fetch a new question and speak it aloud
  async function askAndSpeak() {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastName }),
    });
    const data = await res.json();
    const q = data.question || "Please stand by.";
    setQuestion(q);
    setPqsId(data.meta?.id || null);     // <-- store the authoritative ID
    await speak(q);
  }

  async function speak(text) {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await audio.play();
  }

  // Microphone loop: record 5s chunks → STT → display transcript
  async function startListeningLoop() {
    if (listening) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 48000,
    });

    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    loopRef.current = true;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];
      const transcript = await transcribeBlob(blob);
      if (transcript) {
        setLastTranscript(transcript);
        submitAnswer(transcript);
      }

      if (loopRef.current) {
        setTimeout(() => {
          recorder.start();
          setTimeout(() => recorder.stop(), 5000); // 5s windows, tolerant of pauses
        }, 400);
      }
    };

    setListening(true);
    recorder.start();
    setTimeout(() => recorder.stop(), 5000);
  }

  async function submitAnswer(answer) {
    if (!question || !pqsId) return;

    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: pqsId,
        question,
        userAnswer: answer,
      }),
    });

    const data = await res.json();
    setFeedback(data.feedback || "");
    setCorrect(typeof data.correct === "boolean" ? data.correct : null);

    setTimeout(async () => {
      setFeedback("");
      setCorrect(null);
      setUserInput("");
      await askAndSpeak();
    }, 1500);
  }




  function stopListeningLoop() {
    loopRef.current = false;
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    setListening(false);
  }

  async function transcribeBlob(blob) {
    const res = await fetch("/api/stt", { method: "POST", body: blob });
    const data = await res.json();
    return data.transcript || "";
  }

  // Begin with a question upon login
  useEffect(() => {
    if (status === "authenticated") {
      askAndSpeak();
    }
  }, [status]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 gap-4">
      <div className="w-full max-w-3xl flex items-center justify-between">
        <h1 className="text-2xl font-bold">NROTC PQS Board — Test Rig</h1>
        {status !== "authenticated" ? (
          <button
            onClick={() => signIn("google")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sign in with Google
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm opacity-80">
              Signed in as {session.user.name}
            </span>
            <button
              onClick={() => signOut()}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl grid gap-3">
        <div className="p-4 border rounded">
          <div className="text-sm opacity-70 mb-1">Current Question</div>
          <div className="text-lg font-medium whitespace-pre-wrap">
            {question}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={askAndSpeak}
              className="px-3 py-2 bg-indigo-600 text-white rounded"
            >
              New Random Question
            </button>
          </div>
        </div>

        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitAnswer(userInput);
          }}
          placeholder="Type your answer and press Enter..."
          className="border rounded p-2 w-full"
        />

        {feedback && (
          <div className="mt-2 text-lg">
            {feedback}{" "}
            {correct !== null && (
              <span className={correct ? "text-green-500" : "text-red-500"}>
                {correct ? "✅" : "❌"}
              </span>
            )}
          </div>
        )}



        <div className="p-4 border rounded">
          <div className="text-sm opacity-70 mb-1">Microphone</div>
          <div className="flex items-center gap-2">
            {!listening ? (
              <button
                onClick={startListeningLoop}
                className="px-3 py-2 bg-green-600 text-white rounded"
              >
                Start Listening (always-on)
              </button>
            ) : (
              <button
                onClick={stopListeningLoop}
                className="px-3 py-2 bg-red-600 text-white rounded"
              >
                Stop Listening
              </button>
            )}
          </div>
          <div className="mt-3 text-sm opacity-70">Last transcript</div>
          <div className="font-mono text-sm break-words">
            {lastTranscript || "(waiting...)"}
          </div>
        </div>
      </div>
    </div>
  );
}
