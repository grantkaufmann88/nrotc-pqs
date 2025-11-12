import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,

  // 👇 Enable verbose logs
  debug: true,

  callbacks: {
    async session({ session, token }) {
      console.log("🟢 SESSION CALLBACK:", { session, token });

      // Preserve your original logic to extract last name
      if (session?.user?.name) {
        const parts = session.user.name.trim().split(/\s+/);
        session.user.lastName = parts[parts.length - 1].toUpperCase();
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      console.log("🟢 SIGNIN CALLBACK:", { user, account, profile });
      return true;
    },

    async redirect({ url, baseUrl }) {
      console.log("🟢 REDIRECT CALLBACK:", { url, baseUrl });
      return baseUrl;
    },
  },

  events: {
    async error(message) {
      console.error("❌ NEXTAUTH ERROR EVENT:", message);
    },
  },
});

export { handler as GET, handler as POST };
