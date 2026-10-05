import { siteConfig } from "@/config/site";
import { formatPhone } from "@/lib/format";
import { Logo } from "@/components/brand/Logo";
import { ChiliMark } from "@/components/brand/Chili";
import { OrderLink } from "@/components/ui/OrderLink";
import { MotionSwitch } from "./MotionSwitch";

const socialLabels = { facebook: "فيسبوك", instagram: "إنستجرام", tiktok: "تيك توك" } as const;

/** The last word is the hotline — set as big as the hero's question. */
export function Footer() {
  const social = (Object.keys(socialLabels) as (keyof typeof socialLabels)[])
    .map((k) => ({ key: k, url: siteConfig.social[k] }))
    .filter((s): s is { key: keyof typeof socialLabels; url: string } => Boolean(s.url));
  const { hotline, phone } = siteConfig.contact;

  return (
    <footer className="relative overflow-clip bg-leaf-deep pt-16 pb-28 text-cream md:pt-24 md:pb-12">
      <ChiliMark className="pointer-events-none absolute -bottom-[12%] -left-[6%] h-[70%] w-auto rotate-[28deg] opacity-[0.07]" body="var(--color-cream)" stem="var(--color-cream)" />
      <div className="container-site relative">
        <p className="font-display text-[clamp(1.6rem,4.5vw,2.8rem)] font-bold text-pistachio">لسه محتار؟ كلّمنا.</p>
        <a
          href={`tel:${hotline}`}
          aria-label={`اتصل على ${hotline}`}
          className="font-display block w-fit text-[clamp(5rem,20vw,14rem)] leading-[1.1] font-bold text-cream transition-transform duration-500 ease-swing [text-shadow:0.04em_0.05em_0_var(--color-chili)] hover:-rotate-2"
        >
          {formatPhone(hotline)}
        </a>

        <div className="mt-12 grid gap-10 border-t border-cream/15 pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="w-40" sizes="160px" />
            <p className="font-display mt-4 text-2xl font-bold text-cream/85">كتّر شطة براحتك.</p>
          </div>

          <nav aria-label="روابط الفوتر">
            <p className="mb-3 text-sm font-bold text-cream/60">الموقع</p>
            <ul className="space-y-1 text-cream/85">
              <li>
                <OrderLink className="inline-block py-1.5 hover:text-cream">المنيو كله</OrderLink>
              </li>
              <li>
                <a className="inline-block py-1.5 hover:text-cream" href="#extras">زوّد براحتك</a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="mb-3 text-sm font-bold text-cream/60">تابعنا</p>
            <ul className="space-y-1 text-cream/85">
              {phone && (
                <li>
                  <a href={`tel:${phone}`} dir="ltr" className="inline-block py-1.5">
                    {phone}
                  </a>
                </li>
              )}
              {social.map((s) => (
                <li key={s.key}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block py-1.5 hover:text-cream">
                    {socialLabels[s.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-cream/15 pt-6 text-sm text-cream/60">
          <span>
            © {new Date().getFullYear()} {siteConfig.name} كشري
          </span>
          <MotionSwitch />
        </div>
      </div>
    </footer>
  );
}
