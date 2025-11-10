import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";


const handler = NextAuth({
providers: [
GoogleProvider({
clientId: process.env.GOOGLE_CLIENT_ID,
clientSecret: process.env.GOOGLE_CLIENT_SECRET,
}),
],
callbacks: {
async session({ session, token }) {
// Derive a last name from the Google profile display name
if (session?.user?.name) {
const parts = session.user.name.trim().split(/\s+/);
session.user.lastName = parts[parts.length - 1].toUpperCase();
}
return session;
},
},
});


export { handler as GET, handler as POST };