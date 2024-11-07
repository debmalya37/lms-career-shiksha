import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import {User} from "@/models/user";
import { NextAuthOptions } from "next-auth";



export const authOptions: NextAuthOptions = {
    providers : [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email"},
                password: { label: "Password", type: "password" }

            },
            async authorize(credentials: any): Promise<any>{
                await dbConnect();
                try {
                     const user = await User.findOne({
                        $or: [
                            {email: credentials.indetifier},
                            {password: credentials.indetifier }
                        ]
                    })
                    if(!user) {
                        throw new Error('No User found with this email')
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if(isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error("Incorrect Password")
                    }
                } catch (err:any) {
                    
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if(user){
                token._id = user._id?.toString()
                token.name = user.name
                token.course = user.course
                token.subscription = user.subscription

            }
        return token
        },
        async session({ session, token }) {
            if(token) {
                session.user._id = token._id
                session.user.name = token.name
                session.user.course = token.course
                session.user.subscription = token.subscription
            }
            return session
        },
    },

    pages: {
        signIn: '/sign-in',
        
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}