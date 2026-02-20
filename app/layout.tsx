import type { Metadata } from "next";
import { Roboto } from 'next/font/google'
import "./globals.css";
import localFont from "next/font/local";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";


import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
    title: "Euphoria",
    description: "Discover Your Bliss. Discreetly.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <CartProvider>
                <html lang="en">
                    <head>
                    <link rel="icon" href="/logo.png" sizes="any" />
                    </head>
                    <body className={`${geistSans.className} ${geistMono.className} min-h-screen antialiased`}>
                        {/* <div className="flex flex-col"> */}
                            {children}
                        {/* </div> */}
                    </body> 
                </html>
            </CartProvider>
        </ClerkProvider>
    );
}
