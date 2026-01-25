import NextAuth from "next-auth"; 
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account"
        },
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin", // Custom sign-in page
    signOut: "/auth/signout",
    error: "/auth/error",

  },

  callbacks: {
    async signIn({ user }) {
      const isPoornimaEmail = user.email.endsWith("@poornima.org");
      
      // If not a poornima.org email, check overlords list
      if (!isPoornimaEmail) {
        try {
          const overlord = await prisma.overlord.findUnique({
            where: { email: user.email },
          });
          
          if (!overlord) {
            return false; // Not in overlords list, deny access
          }
        } catch (error) {
          console.error("Error checking overlords:", error);
          return false;
        }
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
        session.user.branch = dbUser.branch || null;
        session.user.section = dbUser.section || null;
        session.user.batch = dbUser.batch || null;
        session.user.phoneNumber = dbUser.phoneNumber || null;
      }

      return session;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl; // Redirect to the app's base URL
    },
  },

  session: {
    maxAge: 604800
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
