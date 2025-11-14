import OpenAI from "openai";
import { randomPQS } from "@/lib/pqs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { lastName = "Doe" } = body || {};

    const item = randomPQS();

    // System prompt focuses GPT: one concise board-style question
    const system = `You are a formal Navy board member testing a 4/C Midshipman, and you should be blunt and nonapolagetic (alsmost arrogant).
Ask one concise question that assesses understanding of the excerpt based off of the expectation, prioritizing knowledge based of of importance.
Never include the answer. For situtuations which might occur frequently, prompts should primarily be eample based, e.g "If you see CO walking..." instead of "Who do you salute", although some questions should target specific regulations rather than examples. Verbatim questions should always be directly asked for. 
And make them similar to the example questions (MUST BE BASED ON PQS GOUGE BOOK).
Use the format: "MIDN" ${lastName}, <question>`;

    // Stringify excerpt for readability/logging
    const excerptText =
      typeof item.excerpt === "object"
        ? JSON.stringify(item.excerpt, null, 2)
        : item.excerpt;
//(Relative importance |X/10| at beggining of each)
    const user = `PQS Title: ${item.title}\nExpectation: ${item.expectation}\nExcerpt:\n${excerptText}\nExample: ${item.example}`;

    // Build message array
    const messages = [
      { role: "system", content: system },
      { role: "user", content: user },
    ];

    // ===== DEBUG LOGGING =====
    console.log("=== GPT PROMPT START ===");
    console.log(
      messages
        .map((m) => `${m.role.toUpperCase()}:\n${m.content}`)
        .join("\n\n---\n\n")
    );
    console.log("=== GPT PROMPT END ===");
    // =========================

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages,
    });

    const question = completion.choices?.[0]?.message?.content?.trim() ?? "";

    // Include expected answer back for optional local grading/feedback
    return new Response(
      JSON.stringify({
        question,
        meta: {
          id: item.id,
          title: item.title,
          expectation: item.expectation,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Error generating question:", e);
    return new Response(
      JSON.stringify({ error: e.message || "Unknown error" }),
      { status: 500 }
    );
  }
}
