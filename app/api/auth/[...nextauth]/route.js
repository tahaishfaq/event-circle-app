import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";


export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error("Email is required");
        }

        await connectDB();
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Incorrect email or password");
        }

        const user = await User.findOne({
          email: credentials.email,
        }).lean();

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Invalid user record");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          profilePicture: user.profilePicture || null,
          role: user.role,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          phoneNumber: user.phoneNumber,
          followers: user.followers,
          following: user.following,
          createdAt: user.createdAt,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fullName = user.fullName;
        token.username = user.username;
        token.email = user.email;
        token.profilePicture = user.profilePicture;
        token.role = user.role;
        token.dateOfBirth = user.dateOfBirth;
        token.gender = user.gender;
        token.phoneNumber = user.phoneNumber;
        token.followers = user.followers;
        token.following = user.following;
        token.createdAt = user.createdAt;
        return token;
      }

      await connectDB();
      const dbUser = await User.findById(token.id).lean();

      if (dbUser) {
        token.fullName = dbUser.fullName;
        token.username = dbUser.username;
        token.email = dbUser.email;
        token.profilePicture = dbUser.profilePicture;
        token.role = dbUser.role;
        token.dateOfBirth = dbUser.dateOfBirth;
        token.gender = dbUser.gender;
        token.phoneNumber = dbUser.phoneNumber;
        token.followers = dbUser.followers;
        token.following = dbUser.following;
        token.createdAt = dbUser.createdAt;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.fullName = token.fullName;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.profilePicture = token.profilePicture;
        session.user.role = token.role;
        session.user.dateOfBirth = token.dateOfBirth;
        session.user.gender = token.gender;
        session.user.phoneNumber = token.phoneNumber;
        session.user.followers = token.followers;
        session.user.following = token.following;
        session.user.createdAt = token.createdAt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };