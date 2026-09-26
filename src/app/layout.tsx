import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lockinwithlav.com"),

  title: "Lock In With Lav",
  description:
    "Build stronger routines, discipline and confidence. Lock in with Lav.",

  openGraph: {
    title: "Lock In With Lav",
    description:
      "Build stronger routines, discipline and confidence. Lock in with Lav.",
    url: "https://www.lockinwithlav.com",
    siteName: "Lock In With Lav",
    images: [
      {
        url: "/Lock-in.png",
        width: 1648,
        height: 928,
        alt: "Lock In With Lav",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lock In With Lav",
    description:
      "Build stronger routines, discipline and confidence. Lock in with Lav.",
    images: ["/Lock-in.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}