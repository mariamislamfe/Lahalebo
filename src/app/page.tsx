import { getBranches, getMenu } from "@/lib/menu-service";
import { AppProviders } from "@/components/AppProviders";
import { Extras, Signature } from "@/components/dishes/Dishes";
import { Hero } from "@/components/hero/Hero";
import { FinalPepper } from "@/components/sections/FinalPepper";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TabletPortal } from "@/components/portal/TabletPortal";
import { Branches } from "@/components/sections/Branches";

/**
 * Small signature moments, not one long scroll story:
 * 1. Hero        the koshary hits the screen (+ the pepper winks in the navbar)
 * 2. Signature   the signature plate + «لهاليبو» on fire; its steam walls off the tablet
 * 3. The tablet  the only menu — all ordering happens on its screen
 *                (product sheet + cart with "طب نحلّيها؟" live in AppProviders)
 * 4. Extras      «طب نحلّيها؟» + drinks
 * 5. Final       the pepper's eye follows you
 * Everything is generated from src/data — add products there, not here.
 */
export default async function HomePage() {
  const [menu, branches] = await Promise.all([getMenu(), getBranches()]);
  const byCat = (id: string) => menu.products.filter((p) => p.categoryId === id && p.available);
  const withPhoto = (list: typeof menu.products) => list.find((p) => p.image) ?? list[0];

  const koshary = withPhoto(byCat("koshary"));
  const tagen = withPhoto(byCat("tawagen"));
  const dessert = withPhoto([...byCat("fateer-sweet"), ...byCat("desserts")]);

  return (
    <AppProviders menu={menu} branches={branches}>
      <a href="#order" className="sr-only z-50 rounded-full bg-coal px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:top-3 focus:right-3">
        تخطّى للطلب
      </a>
      <Navbar />
      <main>
        {koshary && <Hero koshary={koshary} />}
        <Signature />
        <TabletPortal tableFood={[koshary, tagen, dessert].filter((p): p is NonNullable<typeof p> => Boolean(p))} />
        <Extras />
        <FinalPepper />
        <Branches branches={branches} />
      </main>
      <Footer />
    </AppProviders>
  );
}
