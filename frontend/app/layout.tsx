import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Zap } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Live Coaching Feed",
  description: "Premium Realtime coaching feed application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col`}>
        {/* Background glow effects for premium feel */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <nav className="sticky top-0 z-50 w-full glass-nav">
          <div className="container mx-auto px-4 xs:px-6 h-16 flex items-center justify-between">
            <Link 
              href="/" 
              className="font-bold text-lg xs:text-xl tracking-tight text-white flex items-center gap-2 group"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:glow-effect transition-all duration-300">
                <Zap size={20} className="fill-current" />
              </div>
              <span className="hidden xs:inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-blue-400">
                CoachingFeed
              </span>
            </Link>
            <div className="flex items-center gap-3 xs:gap-6">
              <Link 
                href="/" 
                className="text-xs xs:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-500 hover:after:w-full after:transition-all after:duration-300"
              >
                Feed
              </Link>
              <Link 
                href="/admin" 
                className="text-xs xs:text-sm font-medium bg-blue-600/80 backdrop-blur-sm border border-blue-500/50 text-white px-3 xs:px-5 py-1.5 xs:py-2 rounded-full hover:bg-blue-500 hover:glow-effect transition-all duration-300 shadow-lg shadow-blue-500/20"
              >
                Broadcast
              </Link>
            </div>
          </div>
        </nav>
        
        <main className="flex-1 container mx-auto px-4 xs:px-6 py-6 xs:py-8 lg:py-12 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
