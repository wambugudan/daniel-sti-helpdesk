// File: src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "@/libs/prisma";

// Define your auth options separately
export const authOptions = { // <--- EXPORT THIS
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("No user found with that email");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Incorrect password");

        if (!user.approved) throw new Error("Account not approved by admin");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          forcePasswordChange: user.forcePasswordChange, // Include this field for password change logic
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.forcePasswordChange = user.forcePasswordChange;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.forcePasswordChange = token.forcePasswordChange; 
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions); // <--- Use authOptions here

export { handler as GET, handler as POST };
