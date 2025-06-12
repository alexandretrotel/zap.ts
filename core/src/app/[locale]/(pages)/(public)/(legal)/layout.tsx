import React from "react";

import Footer from "@/zap/components/external/footer";
import { Navbar } from "@/zap/components/external/navbar";

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
