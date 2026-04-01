import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevBlog - Kiến Thức Dành Cho Lập Trình Viên",
  description: "Nơi chia sẻ kiến thức và kinh nghiệm về lập trình và công nghệ.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="antialiased bg-[#0b0f19] text-white selection:bg-pink-500 selection:text-white">
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
