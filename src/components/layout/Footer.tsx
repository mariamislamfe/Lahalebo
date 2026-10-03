import { siteConfig } from "@/config/site";
import { formatPhone } from "@/lib/format";
import { Logo } from "@/components/brand/Logo";
import { OrderLink } from "@/components/ui/OrderLink";
import { MotionSwitch } from "./MotionSwitch";

const socialLabels = { facebook: "فيسبوك", instagram: "إنستجرام", tiktok: "تيك توك" } as const;

export function Footer() {
  const social = (Object.keys(socialLabels) as (keyof typeof socialLabels)[])
    .map((k) => ({ key: k, url: siteConfig.social[k] }))
    .filter((s): s is { key: keyof typeof socialLabels; url: string } => Boolean(s.url));
  const { hotline, phone } = siteConfig.contact;

  return (
    <footer className="surface-leaf pt-14 pb-28 text-cream md:pb-12">
      <div className="container-site grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo className="w-40" sizes="160px" />
          <p className="font-display mt-4 text-2xl font-bold text-cream/85">كتّر شطة براحتك.</p>
        </div>

        <nav aria-label="روابط الفوتر">
          <p className="mb-3 text-sm font-bold text-cream/70">الموقع</p>
          <ul className="space-y-2 text-cream/85">
            <li>
              <OrderLink className="inline-block py-1.5 hover:text-cream">اطلب من التابلت</OrderLink>
            </li>
            <li>
              <a className="inline-block py-1.5 hover:text-cream" href="#top">جعان؟ من الأول</a>
            </li>
          </ul>
        </nav>

        <div>
          <p className="mb-3 text-sm font-bold text-cream/70">كلّمنا</p>
          <ul className="space-y-2 text-cream/85">
            <li>
              <a href={`tel:${hotline}`} className="font-display text-3xl text-cream hover:text-leaf-bright">
                {formatPhone(hotline)}
              </a>
            </li>
            {phone && (
              <li>
                <a href={`tel:${phone}`} dir="ltr">{phone}</a>
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
      <div className="container-site mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-cream/15 pt-6 text-sm text-cream/60">
        <span>
          © {new Date().getFullYear()} {siteConfig.name} كشري
        </span>
        <MotionSwitch />
      </div>
    </footer>
  );
}
