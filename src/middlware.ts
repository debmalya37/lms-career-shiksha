import { NextRequest, NextResponse } from 'next/server'
export {default } from "next-auth/middleware";
import { getToken } from 'next-auth/jwt';
import { authOptions } from './app/api/auth/[...nextauth]/options';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {

    const token= await getToken({req: request})
    const url = request.nextUrl

    if(token && 
        (
            url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up')
            
        )
        ) {
            return NextResponse.redirect(new URL('/', request.url))
    }


        return NextResponse.redirect(new URL('/', request.url))
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/',
    '/admin/:path*'
]
}