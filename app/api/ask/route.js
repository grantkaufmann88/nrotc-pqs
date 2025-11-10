import OpenAI from "openai";
import { randomPQS } from "@/lib/pqs";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function POST(req) {
try {
const body = await req.json().catch(() => ({}));
const { lastName = "MIDSHIPMAN" } = body || {};


const item = randomPQS();


// System prompt focuses GPT: one concise board-style question
const system = `You are a formal Navy board member testing a 4/C Midshipman.\nAsk exactly ONE concise question that assesses understanding of the excerpt.\nNever include the answer. Use the format: \"MIDN ${lastName} <question>\"`;


const user = `PQS Title: ${item.title}\nExpectation: ${item.expectation}\nExcerpt:\n${item.excerpt}`;


const completion = await openai.chat.completions.create({
model: "gpt-4o-mini",
temperature: 0.2,
messages: [
{ role: "system", content: system },
{ role: "user", content: user },
],
});


const question = completion.choices[0].message.content.trim();


// Include expected answer back for optional local grading/feedback
return new Response(
JSON.stringify({
question,
meta: { id: item.id, title: item.title, expectation: item.expectation },
}),
{ status: 200, headers: { "Content-Type": "application/json" } }
);
} catch (e) {
return new Response(JSON.stringify({ error: e.message }), { status: 500 });
}
}