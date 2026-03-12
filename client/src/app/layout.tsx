import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { MeetingsProvider } from "@/context/MeetingsContext";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plex Meet",
  description: "Premium real-time video meetings powered by WebRTC",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <MeetingsProvider>{children}</MeetingsProvider>
      </body>
    </html>
  );
}

