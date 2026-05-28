"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddQuoteModal from "@/components/AddQuoteModal";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border-custom bg-card-custom/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="group flex flex-col">
              <h1 className="font-serif text-xl font-bold tracking-tight text-foreground group-hover:text-accent-custom transition-colors">
                Words
              </h1>
              <p className="hidden text-[10px] font-bold tracking-widest text-foreground/60 sm:block">
                words.harshrb.in
              </p>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs font-semibold shadow-xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Whisper Quote</span>
            </button>
          </div>
        </div>
      </header>

      {/* Whisper Quote Creation Modal */}
      <AddQuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
