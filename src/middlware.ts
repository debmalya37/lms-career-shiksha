// import { NextResponse } from 'next/server'
// export {default } from "next-auth/middleware";
// import type { NextRequest } from 'next/server'
// import connectMongo from '@/lib/db';
// import  {User}  from '../src/models/user';

// // List of allowed emails for /admin/* access
// const allowedEmails = ['debmalyasen37@gmail.com', 'civilacademy.in@gmail.com'];

// export async function middleware(request: NextRequest) {
//   // Check if the request path starts with /admin
//   if (request.nextUrl.pathname.startsWith('/admin')) {
//     const sessionToken = request.cookies.get('sessionToken')?.value;
  
//     console.log("middlware sessiontoken", sessionToken);
//     if (!sessionToken) {
//       return NextResponse.redirect(new URL('/', request.url));
//     }

//     try {
//       // Connect to MongoDB and validate the session token
//       await connectMongo();
//       const user = await User.findOne({ sessionToken });

//       if (!user || !allowedEmails.includes(user.email)) {
//         // If user is not found or email is not in the allowed list, redirect to /
//         return NextResponse.redirect(new URL('/', request.url));
//       }

//       // User is authenticated and has access to /admin/* pages
//       return NextResponse.next();
//     } catch (error) {
//       console.error('Error in middleware:', error);
//       return NextResponse.redirect(new URL('/', request.url));
//     }
//   }

//   // Allow other requests to proceed
//   return NextResponse.next();
// }

// export const config = {
//   matcher: '/admin/:path*', // Applies to all routes under /admin
// };














// import { NextRequest, NextResponse } from 'next/server'
// export {default } from "next-auth/middleware";
// import { getToken } from 'next-auth/jwt';
// import { authOptions } from './app/api/auth/[...nextauth]/options';

// // This function can be marked `async` if using `await` inside
// export async function middleware(request: NextRequest) {

//     const token= await getToken({req: request})
//     const url = request.nextUrl

//     if(token && 
//         (
//             url.pathname.startsWith('/sign-in') ||
//             url.pathname.startsWith('/sign-up')
            
//         )
//         ) {
//             return NextResponse.redirect(new URL('/', request.url))
//     }


//         return NextResponse.redirect(new URL('/', request.url))
// }

// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: [
//     '/sign-in',
//     '/sign-up',
//     '/',
//     '/admin/:path*'
// ]
// }