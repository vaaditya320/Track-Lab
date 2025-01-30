import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define authOptions and export it
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email.endsWith("@poornima.org")) {
        return false; // Restrict login to college email IDs
      }

      try {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          existingUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              regId: user.email.split("@")[0], // Extract reg ID from email
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },

    async session({ session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.regId = dbUser.regId;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export GET handler using authOptions
export const GET = (req, res) => NextAuth(req, res, authOptions);

// Export POST handler using authOptions
export const POST = (req, res) => NextAuth(req, res, authOptions);
