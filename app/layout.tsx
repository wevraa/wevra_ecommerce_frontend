import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.scss";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WEVRAA – Custom Stitching & Fabric-Led Fashion",
  description: "A modern Indian platform for custom stitching and fabric-led fashion. Bulk wedding orders, boutique orders, uniform stitching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoCondensed.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
