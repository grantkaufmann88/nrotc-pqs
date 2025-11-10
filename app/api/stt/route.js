import fs from "fs";
import path from "path";

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const keyPath = path.join("/tmp", "google-key.json");
  fs.writeFileSync(keyPath, process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

import { SpeechClient } from "@google-cloud/speech";


export async function POST(req) {
try {
const arrayBuffer = await req.arrayBuffer();
const audioBytes = Buffer.from(arrayBuffer);


const client = new SpeechClient();


// Using v1 config compatible with WEBM_OPUS (auto-detect works well)
const [response] = await client.recognize({
config: {
encoding: "WEBM_OPUS",
languageCode: "en-US",
enableAutomaticPunctuation: true,
model: "latest_long", // tolerant of pauses
},
audio: { content: audioBytes.toString("base64") },
});


const transcript = (response.results || [])
.map((r) => r.alternatives?.[0]?.transcript || "")
.join(" ")
.trim();


return new Response(JSON.stringify({ transcript }), {
status: 200,
headers: { "Content-Type": "application/json" },
});
} catch (e) {
return new Response(JSON.stringify({ error: e.message }), { status: 500 });
}
}