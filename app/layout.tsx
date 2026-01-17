import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter for premium look
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PVS Mart - Fresh & Quality",
  description: "Your local smart grocery store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
