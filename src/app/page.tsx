import { getBranches, getMenu } from "@/lib/menu-service";
import { siteConfig } from "@/config/site";
import { startingPrice } from "@/lib/pricing";
import { AppProviders } from "@/components/AppProviders";
import { CondimentStation } from "@/components/extras/CondimentStation";
import { Hero } from "@/components/hero/Hero";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { CravingMenu } from "@/components/menu/CravingMenu";
import { ChiliStorm } from "@/components/storm/ChiliStorm";
import { Branches } from "@/components/sections/Branches";
import { SweetAndCold } from "@/components/sweet/SweetAndCold";

/**
 * Several small original moments — not one long scroll story
 * (direction: docs/creative-direction.md):
 * 1. Hero       «مش عارف تاكل إيه؟» — the photo frame swings in, «إحنا عارفين.» (+ the pepper winks)
 *    Storm      the chili storm, «زوّد شطة.» — hero → menu
 * 2. Menu       «نفسك في إيه؟» — categories on the side, dish names on top, one dish at a time
 * 3. Extras     «زوّد براحتك» — the condiment counter
 * 4. Sweet/cold «طب نحلّيها؟» turns sideways into «حاجة ساقعة»
 * The dessert nudge, the product sheet and the cart live in AppProviders.
 * Everything is generated from src/data — add products there, not here.
 */
export default async function HomePage() {
  const [menu, branches] = await Promise.all([getMenu(), getBranches()]);

  const koshary = menu.products.filter((p) => p.categoryId === "koshary" && p.available);
  const prices = koshary.map(startingPrice).filter((p): p is number => p !== null);
  const cravings = menu.categories.filter((c) => c.available && c.id !== "sides" && menu.products.some((p) => p.categoryId === c.id && p.available));

  return (
    <AppProviders menu={menu} branches={branches}>
      <a href="#order" className="sr-only z-50 rounded-full bg-coal px-4 py-2 text-cream focus:not-sr-only focus:fixed focus:top-3 focus:right-3">
        تخطّى للمنيو
      </a>
      <Navbar />
      <main>
        <Hero plate={siteConfig.heroImage} fromPrice={prices.length ? Math.min(...prices) : null} cravings={cravings} />
        <ChiliStorm />
        <CravingMenu />
        <CondimentStation />
        <SweetAndCold />
        <Branches branches={branches} />
      </main>
      <Footer />
    </AppProviders>
  );
}
