import Footer from "@/components/zap/public/footer";
import { Navbar } from "@/components/zap/public/navbar";
import React from "react";

interface LegalLayoutProps {
  children: React.ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-12 md:py-24">{children}</div>
      <Footer />
    </>
  );
}
