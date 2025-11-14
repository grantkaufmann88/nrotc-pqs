// app/api/check/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getPQSById } from "@/lib/pqs";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions"; // ✅ added

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { id, question, userAnswer } = await req.json();

    console.log("📝 Incoming grading request:", { id, question, userAnswer });

    const item = getPQSById(id);
    if (!item) {
      console.error("❌ PQS item not found:", id);
      return NextResponse.json(
        { error: "PQS item not found", correct: false, feedback: "Item not found." },
        { status: 400 }
      );
    }

    // SYSTEM INSTRUCTIONS — the grading behavior
    const system = `
You are an NROTC PQS board grader.
Evaluate the user's answer using ONLY the provided PQS reference as the source of truth.
Be concise and professional. If the user is close, you may mark correct but note minor issues. 
The MIDN does not need to answer all topics mentioned in the excerpt, as long as the MIDN correctly and appropriately answers the question asked they are correct.
Return STRICT JSON ONLY with keys: "correct" (true/false) and "feedback" (string). No extra text. Be very relaxed overall with correctness vs incorrectness.
`;

    // USER MESSAGE — includes the gouge
    const excerptText =
      typeof item.excerpt === "object"
        ? JSON.stringify(item.excerpt, null, 2)
        : item.excerpt;

    const user = `PQS Title: ${item.title}\nExpectation: ${item.expectation}\nExcerpt:\n${excerptText}\nExample: ${item.example},User Answer: ${userAnswer}`;

    // ✅ Log what’s actually being sent to OpenAI
    console.log("📘 SYSTEM PROMPT SENT TO MODEL:\n", system);
    console.log("👤 USER PROMPT SENT TO MODEL:\n", user);

    // ✅ Properly typed messages array
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];

    // 🔹 Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages,
    });

    // ✅ Log the full API response
    console.log("📦 OpenAI raw response:\n", JSON.stringify(completion, null, 2));

    const json = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(json);

    const result = {
      correct: !!parsed.correct,
      feedback: typeof parsed.feedback === "string" ? parsed.feedback : "",
    };

    console.log("✅ Grading result:", result);

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    console.error("💥 Error during grading:", e);
    return NextResponse.json(
      { error: e.message || "Grading error", correct: false, feedback: "Grading failed." },
      { status: 500 }
    );
  }
}
