import Link from "next/link";
import { cta } from "@/content/copy";
import { ChiliMark } from "@/components/brand/Chili";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-6 text-center">
      <div className="max-w-md">
        <ChiliMark className="mx-auto mb-6 h-28 w-auto rotate-12" />
        <h1 className="font-display text-5xl">الصفحة دي مش في المنيو.</h1>
        <p className="mt-3 text-lg text-smoke">بس الأكل لسه موجود.</p>
        <Link
          href="/#menu"
          className="mt-8 inline-flex h-13 items-center rounded-full bg-chili px-8 text-lg font-bold text-cream shadow-cta"
        >
          {cta.browse}
        </Link>
      </div>
    </main>
  );
}
