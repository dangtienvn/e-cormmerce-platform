import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Kernel – Kiến Thức Lập Trình",
  description: "Nơi chia sẻ kiến thức sâu về JavaScript, Next.js, System Design và hành trình phát triển phần mềm chuẩn Production.",
  openGraph: {
    title: "Kernel – Kiến Thức Lập Trình",
    description: "JavaScript, Next.js, System Design & DevOps cho Developer Việt Nam.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased bg-[#f8fafc] text-slate-900 selection:bg-teal-500 selection:text-white">
        <div className="flex flex-col min-h-screen font-sans">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
