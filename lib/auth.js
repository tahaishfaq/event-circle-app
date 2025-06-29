import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "./mongodb"
import User from "../models/User"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectDB()
        const user = await User.findOne({ email: credentials.email })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id,
          email: user.email,
          name: user.fullName,
          username: user.username,
          role: user.role,
          profilePicture: user.profilePicture,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.username = user.username
        token.profilePicture = user.profilePicture
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.username = token.username
      session.user.profilePicture = token.profilePicture
      session.user.id = token.sub
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
}

export default NextAuth(authOptions)
