import type { ReactNode } from "react";
import type { Branch } from "@/types/branch";
import { formatNumber } from "@/lib/format";
import { ClockIcon, PhoneIcon, PinIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";

/** Renders whatever verified data exists; missing fields read "قريبًا", never a guess. */
export function Branches({ branches }: { branches: Branch[] }) {
  if (branches.length === 0) return null;
  const hasPlaceholder = branches.some((b) => b.isPlaceholder);

  return (
    <section id="branches" aria-labelledby="branches-title" className="bg-cream py-16 md:py-24">
      <div className="container-site">
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 id="branches-title" className="font-display text-section">
            تلاقينا <span className="text-leaf">فين؟</span>
          </h2>
          {hasPlaceholder && (
            <p className="rounded-full bg-leaf/10 px-4 py-2 text-sm font-bold text-leaf-deep">
              بيانات الفروع بتتحدّث — قريبًا هنا
            </p>
          )}
        </Reveal>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((b, i) => (
            <Reveal as="li" key={b.id} delay={i * 80}>
              <article className="flex h-full flex-col rounded-panel bg-paper p-6 ring-1 ring-coal/8 md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-display text-5xl leading-none text-chili">
                    {formatNumber(i + 1).padStart(2, "٠")}
                  </span>
                  {b.area && <span className="rounded-full bg-leaf px-3 py-1 text-[13px] font-bold text-cream">{b.area}</span>}
                </div>
                <h3 className="font-display text-[2rem] leading-none">{b.name}</h3>
                <dl className="mt-5 space-y-3 text-[15px]">
                  <Row icon={<PinIcon size={18} />} label="العنوان" value={b.address} />
                  <Row icon={<ClockIcon size={18} />} label="المواعيد" value={b.hours} />
                </dl>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {b.phone && (
                    <a
                      href={`tel:${b.phone}`}
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-chili px-5 font-bold text-cream"
                    >
                      <PhoneIcon size={18} />
                      <span dir="ltr">{b.phone}</span>
                    </a>
                  )}
                  {b.mapUrl && (
                    <a
                      href={b.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-leaf px-5 font-bold text-leaf hover:bg-leaf hover:text-cream"
                    >
                      <PinIcon size={18} />
                      افتح الخريطة
                    </a>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      <dt className="mt-0.5 text-leaf">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd className={value ? "text-coal" : "text-smoke"}>{value ?? `${label} — قريبًا`}</dd>
    </div>
  );
}
