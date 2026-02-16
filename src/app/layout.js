import { Geist, Geist_Mono } from "next/font/google";
import "sweetalert2/dist/sweetalert2.min.css";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LMS Platform - Modern Education",
  description: "A learning management system built for modern education.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
