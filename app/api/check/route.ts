// app/api/check/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getPQSById } from "@/lib/pqs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { id, question, userAnswer } = await req.json();

    // Fetch the authoritative PQS item for reference-grounded grading
    const item = getPQSById(id);
    if (!item) {
      return NextResponse.json(
        { error: "PQS item not found", correct: false, feedback: "Item not found." },
        { status: 400 }
      );
    }

    const system = `
You are an NROTC PQS board grader.
Evaluate the user's answer using ONLY the provided PQS reference as the source of truth.
Be concise and professional. If the user is close, you may mark correct but note minor issues.
Return STRICT JSON ONLY with keys: "correct" (true/false) and "feedback" (string). No extra text.
`;

    const user = `
Question: ${question}

User Answer: ${userAnswer}

Authoritative PQS Reference:
- Title: ${item.title}
- Expectation: ${item.expectation}
- Excerpt:
${item.excerpt}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const json = completion.choices[0].message.content;
    const parsed = JSON.parse(json);

    // Ensure shape
    const result = {
      correct: !!parsed.correct,
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: e.message || "Grading error", correct: false, feedback: "Grading failed." },
      { status: 500 }
    );
  }
}