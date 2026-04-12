import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "fate.rip | Home",
  description: "Claim your unique profile link today.",
  icons: {
    icon: "https://media.discordapp.net/attachments/1492245469785755840/1492688630685106347/scythe.png?ex=69dc3e1e&is=69daec9e&hm=ff8a4b2ed25f7a8b663564ff4c1526d69b7469e999a7e8ea4722dfae6b2c640e&=&format=webp&quality=lossless",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
