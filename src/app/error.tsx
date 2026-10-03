"use client";

import { ChiliMark } from "@/components/brand/Chili";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-6 text-center">
      <div className="max-w-md">
        <ChiliMark className="mx-auto mb-6 h-28 w-auto -rotate-12" />
        <h1 className="font-display text-5xl">حصلت مشكلة عندنا.</h1>
        <p className="mt-3 text-lg text-smoke">المشكلة مش عندك. جرّب تاني، ولو فضلت كلّمنا.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 h-13 rounded-full bg-chili px-8 text-lg font-bold text-cream shadow-cta"
        >
          جرّب تاني
        </button>
      </div>
    </main>
  );
}
