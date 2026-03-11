import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { AppProvider } from "@/utils/AppContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NeuroNotes AI | Study Assistant",
  description: "AI-powered study assistant for students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased flex h-screen overflow-hidden bg-slate-950 text-slate-100 relative`}
      >
        <AppProvider>
          {/* Premium futuristic gradient background with multiple layers */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Main gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900" />
            
            {/* Animated gradient orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/30 blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-15%] right-[-5%] w-[60%] h-[60%] rounded-full bg-purple-900/25 blur-[160px]" />
            <div className="absolute top-[30%] left-[50%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[140px] opacity-50" />
            <div className="absolute bottom-[20%] right-[40%] w-[30%] h-[30%] rounded-full bg-pink-900/15 blur-[120px] opacity-40" />
            
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0.05) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.05) 75%, rgba(99, 102, 241, 0.05) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(99, 102, 241, 0.05) 25%, rgba(99, 102, 241, 0.05) 26%, transparent 27%, transparent 74%, rgba(99, 102, 241, 0.05) 75%, rgba(99, 102, 241, 0.05) 76%, transparent 77%, transparent)`,
                  backgroundSize: '50px 50px'
                }}
              />
            </div>
          </div>

          <Sidebar />
          <main className="flex-1 h-full overflow-y-auto relative z-0">
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  );
}
