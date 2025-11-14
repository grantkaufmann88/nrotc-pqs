import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // stored in your Vercel env vars
});

export async function POST(req) {
  const { userAnswer } = await req.json();

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a Navy ROTC PQS question generator. Ask short, relevant questions to test 4/C candidates.",
      },
      {
        role: "user",
        content: `The midshipman answered: "${userAnswer}". Indicate whether they are correct or not and ask another question.`,
      },
    ],
  });

  const question = completion.choices[0].message.content.trim();
  return Response.json({ question });
}
