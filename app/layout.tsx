import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/footer";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export const metadata: Metadata = {
  title: "AI QA Assistant",
  description: "AI-assisted QA documentation and test design for modern teams."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-black text-white">
        <Providers>
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />
              <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
