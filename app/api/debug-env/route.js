export async function GET() {
  return new Response(
    JSON.stringify({
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || null,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ exists" : "❌ missing",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ exists" : "❌ missing",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
