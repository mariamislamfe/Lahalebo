import { ChiliMark } from "@/components/brand/Chili";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="بيحمّل" className="grid min-h-dvh place-items-center bg-orange">
      <ChiliMark className="h-24 w-auto animate-bump" />
    </div>
  );
}
