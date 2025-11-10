import fs from "fs";
import path from "path";

if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const keyPath = path.join("/tmp", "google-key.json");
  fs.writeFileSync(keyPath, process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;
}

import textToSpeech from "@google-cloud/text-to-speech";


export async function POST(req) {
try {
const { text } = await req.json();
if (!text) return new Response("Missing text", { status: 400 });


const client = new textToSpeech.TextToSpeechClient();


const [response] = await client.synthesizeSpeech({
input: { text },
// Choose an authoritative/enunciated US English voice
voice: { languageCode: "en-US", name: "en-US-Wavenet-D" },
audioConfig: { audioEncoding: "MP3", speakingRate: 0.95 },
});


const audio = response.audioContent;
return new Response(Buffer.from(audio), {
status: 200,
headers: {
"Content-Type": "audio/mpeg",
"Cache-Control": "no-store",
},
});
} catch (e) {
return new Response(JSON.stringify({ error: e.message }), { status: 500 });
}
}