// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // 1. JWT Callback: Copy profile info into the token
    async jwt({ token, account, profile }) {
      // 'account' and 'profile' are only available on the FIRST sign in.
      if (account) {
        // Example: Copy profile image from the Google profile data
        token.picture = profile.picture;
        token.id = profile.id; // Also copying the ID again just in case
      }
      return token
    },

    // 2. Session Callback: Copy the info from the token into the session
    async session({ session, token }) {
      if (token.picture) {
        session.user.image = token.picture; // 👈 This line adds the image to session.user
      }
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}

export default NextAuth(authOptions)