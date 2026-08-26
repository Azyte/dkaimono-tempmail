import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TempMail Pro Max — Custom Domain & Catch-All Spam Safe Temp Email",
  description: "Temporary Disposable Email with Custom Domain, Catch-All Routing, MX Configuration, and Zero-Drop Spam Inbound.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
