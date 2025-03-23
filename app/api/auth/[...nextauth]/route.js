import NextAuth from "next-auth"; 
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  pages: {
    signIn: "/auth/signin", // Custom sign-in page
  },

  callbacks: {
    async signIn({ user }) {
      if (!user.email.endsWith("@poornima.org")) {
        return false; // Restrict login to college emails
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

    async session({ session }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.regId = dbUser.regId;
        session.user.role = dbUser.role;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl; // Redirect to the app's base URL
    },
  },

  session: {
    maxAge: 24 * 60 * 60, // Set session timeout to 1 day
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
