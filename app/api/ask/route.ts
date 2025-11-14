import OpenAI from "openai";
import { randomPQS } from "@/lib/pqs";


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function POST(req) {
try {
const body = await req.json().catch(() => ({}));
const { lastName = "X" } = body || {};


const item = randomPQS();


// System prompt focuses GPT: one concise board-style question
const system = `You are a formal Navy board member testing a 4/C Midshipman.\nAsk a concise question that assesses understanding of the excerpt based off of the expectation.\nNever include the answer. Use the format: \"MIDN\" ${lastName} <question>. 
Example Questions/Responses:
MIDN X, If you are outdoors uniform at 1600 and run into CO and MSgt, what would you do?,
MIDN X, what is the rank and insignia of an E-7 in the Navy?,
MIDN X, list two people you could go to for restricted SAPR report,
MIDN X, who is the chief of Naval Personell,
MIDN X, describe the lab response procedure during company Lab if addressing XO
MIDN X, what are 2 things you MUST bring to PT
MIDN X, what is the mission of the NROTC, verbatim
MIDN X, wwhat is one major difference between the oath of office and the oath of enlistment
`;


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