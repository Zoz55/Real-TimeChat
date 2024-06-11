import Head from 'next/head';
import { inter } from "./fonts";
import "./globals.css";


export const metadata = {
  title: "Elites",
  description: " Elites CHat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <Head>
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/icons/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
      <meta name="theme-color" content="#000000" />
    </Head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
