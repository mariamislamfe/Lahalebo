import type { Category, Extra, Menu, Product, ProductImage, ProductOption } from "@/types/menu";

/**
 * LAHALEBO MENU — names and prices from the official menu pages (Oct 2026).
 * Every section of the site (hero, signature, tablet, cart, recommendations)
 * is generated from this file: edit here, nothing else.
 *
 * Photos: real Lahalebo shoots in /public/menu (hd = cut-out, photos = full frame).
 * Where a photo is shared between similar dishes it is marked "shared photo".
 * Dishes without a photo show a brand colour poster with the name.
 */

/* ---------- photos ---------- */

const cut = (file: string, alt: string, width: number, height: number): ProductImage => ({
  src: `/menu/hd/${file}.png`,
  alt,
  width,
  height,
  cutout: true,
});
const photo = (file: string, alt: string, focus?: string): ProductImage => ({
  src: `/menu/photos/${file}.jpg`,
  alt,
  width: 1024,
  height: 1280,
  focus,
});

const img = {
  kosharyBowl: cut("koshary-bowl", "علبة كشري لهاليبو", 887, 554),
  kosharyPlate: cut("koshary-plate", "طبق كشري لهاليبو على الصينية الخضرا", 815, 534),
  kosharyFamily: photo("koshary-family", "كشري لهاليبو على الترابيزة", "50% 55%"),
  pastaMeat: cut("pasta-plate", "مكرونة باللحمة المفرومة", 559, 460),
  ovenChicken: cut("oven-tray", "صينية مكرونة كرسبي تشيكن من الفرن", 444, 316),
  ovenTrays: photo("oven-trays", "صواني مكرونة من الفرن", "35% 60%"),
  fateerCut: cut("fateer", "فطيرة لهاليبو", 870, 504),
  fateerA: photo("fateer-chicken", "فطاير لهاليبو", "50% 45%"),
  fateerB: photo("fateer-supreme", "فطيرة لهاليبو في العلبة", "50% 50%"),
  fateerC: photo("fateer-bbq", "فطيرة لهاليبو مع بطاطس", "45% 60%"),
  fateerD: photo("fateer-trio", "فطيرة لهاليبو على اللوح الخشب", "50% 65%"),
  trayApple: photo("tray-apple", "فطيرة تفاح", "50% 80%"),
  trayDates: photo("tray-dates", "فطيرة بلح", "50% 80%"),
  trayLotus: photo("tray-lotus", "فطيرة لوتس", "50% 80%"),
  trayPistachio: photo("tray-pistachio", "فطيرة فستق", "50% 80%"),
  trayBerries: photo("tray-berries", "فطيرة بلوبيري", "50% 80%"),
  trayDubai: cut("dessert-tray", "فطيرة دبي", 915, 568),
  trayDuetto: photo("tray-duetto", "دويتو الفطير", "50% 80%"),
};

/* ---------- helpers ---------- */

const mL = (m: number, l: number): ProductOption[] => [
  { id: "m", name: "وسط", price: m },
  { id: "l", name: "كبير", price: l },
];
const sML = (s: number, m: number, l: number): ProductOption[] => [
  { id: "s", name: "صغير", price: s },
  { id: "m", name: "وسط", price: m },
  { id: "l", name: "كبير", price: l },
];

/** Koshary add-ons — the الإضافات prices from the menu. */
const kosharyExtras: Extra[] = [
  { id: "x-salsa", name: "صلصة زيادة", price: 8 },
  { id: "x-ta2leya", name: "تقلية زيادة", price: 8 },
  { id: "x-hummus", name: "حمص زيادة", price: 8 },
  { id: "x-3ads", name: "عدس زيادة", price: 8 },
  { id: "x-shatta", name: "شطة", price: 1 },
  { id: "x-da2a", name: "دقة", price: 1 },
];
const kosharyChoices = [
  { id: "onion", name: "بصل كتير" },
  { id: "shatta", name: "شطة كتير" },
  { id: "da2a", name: "دقة كتير" },
];
const sweetPairing = ["rice-pudding", "creme-caramel", "tray-lotus"];

const koshary = (id: string, name: string, price: number, image: ProductImage, extra: Partial<Product> = {}): Product => ({
  id,
  slug: id,
  name,
  price,
  image,
  categoryId: "koshary",
  available: true,
  extras: kosharyExtras,
  choicesLabel: "على مزاجك",
  choices: kosharyChoices,
  recommendations: sweetPairing,
  ...extra,
});

const item = (id: string, name: string, categoryId: string, p: number | ProductOption[], extra: Partial<Product> = {}): Product => ({
  id,
  slug: id,
  name,
  categoryId,
  available: true,
  price: typeof p === "number" ? p : Math.min(...p.map((o) => o.price ?? Infinity)),
  options: typeof p === "number" ? undefined : p,
  ...extra,
});

/* ---------- categories ---------- */

export const categories: Category[] = [
  { id: "koshary", slug: "koshary", name: "كشري", craving: "حاجة تولّع", surface: "orange", sortOrder: 1, available: true },
  { id: "tawagen", slug: "tawagen", name: "طواجن", craving: "لسه طالعة من الفرن", surface: "red", sortOrder: 2, available: true },
  { id: "pasta", slug: "pasta", name: "مكرونة", craving: "حاجة تقيلة", surface: "red", sortOrder: 3, available: true },
  { id: "fateer-salty", slug: "fateer-salty", name: "فطير حادق", craving: "سخن ومقرمش", surface: "orange", sortOrder: 4, available: true },
  { id: "fateer-sweet", slug: "fateer-sweet", name: "فطير حلو", craving: "حاجة تحلّي", surface: "cream", sortOrder: 5, available: true },
  { id: "pizza", slug: "pizza", name: "بيتزا", craving: "جبنة بتشد", surface: "red", sortOrder: 6, available: true },
  { id: "desserts", slug: "desserts", name: "حلويات", craving: "ختامها مسك", surface: "cream", sortOrder: 7, available: true },
  { id: "drinks", slug: "drinks", name: "مشروبات", craving: "حاجة ساقعة", surface: "leaf", sortOrder: 8, available: true },
  { id: "sides", slug: "sides", name: "إضافات", craving: "الحاجات الصغيرة", surface: "leaf", sortOrder: 9, available: true },
];

/* ---------- products ---------- */

export const products: Product[] = [
  /* الكشري */
  koshary("koshary-regular", "كشري عادي", 18, img.kosharyBowl),
  koshary("koshary-special", "كشري اسبشيل", 25, img.kosharyBowl), // shared photo
  koshary("koshary", "كشري لهاليبو", 30, img.kosharyPlate, { tagline: "كتّر شطة براحتك.", badge: "الأكثر طلبًا", featured: true }),
  koshary("koshary-lux", "كشري لهاليبو لوكس", 35, img.kosharyPlate), // shared photo
  koshary("koshary-super", "كشري سوبر لهاليبو", 45, img.kosharyFamily),
  koshary("koshary-jumbo", "كشري جامبو", 55, img.kosharyFamily, { tagline: "للّمة." }), // shared photo

  /* طواجن */
  item("tagen-meat", "طاجن مكرونة باللحمة المفرومة", "tawagen", 50, { image: img.pastaMeat, tagline: "لسه طالع من الفرن.", featured: true, recommendations: sweetPairing }),
  item("tagen-meat-mozz", "طاجن مكرونة باللحمة موتزاريلا", "tawagen", 70, { image: img.pastaMeat }), // shared photo
  item("tagen-chicken", "طاجن مكرونة بالفراخ", "tawagen", 55),
  item("tagen-chicken-mozz", "طاجن مكرونة بالفراخ موتزاريلا", "tawagen", 75),
  item("tagen-sausage", "طاجن مكرونة بالسجق", "tawagen", 50),

  /* المكرونة */
  item("pasta-crispy", "مكرونة كرسبي تشيكن", "pasta", mL(120, 160), { image: img.ovenChicken, tagline: "جديد", recommendations: sweetPairing }),
  item("pasta-hotdog", "مكرونة هوت دوج", "pasta", mL(110, 150), { image: img.ovenTrays, tagline: "جديد" }),
  item("pasta-supreme", "مكرونة سوبريم", "pasta", mL(160, 220), { tagline: "جديد" }),
  item("pasta-bechamel", "مكرونة بالبشاميل", "pasta", mL(100, 140)),
  item("pasta-negresco", "مكرونة نجرسكو", "pasta", mL(130, 175)),
  item("pasta-mixed-meat", "مكرونة مشكل لحوم", "pasta", mL(110, 150)),

  /* فطير حادق — photos are shared between flavours until each has its own */
  item("fateer-shawarma-chicken", "فطيرة شاورما فراخ", "fateer-salty", mL(150, 210), { image: img.fateerCut, recommendations: sweetPairing }),
  item("fateer-lahalebo-meat", "فطيرة لهاليبو لحوم", "fateer-salty", mL(170, 250), { image: img.fateerC }),
  item("fateer-lahalebo-cheese", "فطيرة لهاليبو جبن", "fateer-salty", mL(150, 220), { image: img.fateerB }),
  item("fateer-veg", "فطيرة خضار", "fateer-salty", mL(100, 140)),
  item("fateer-sausage", "فطيرة سجق", "fateer-salty", mL(135, 185)),
  item("fateer-minced", "فطيرة لحمة مفروم", "fateer-salty", mL(140, 200)),
  item("fateer-basterma", "فطيرة بسطرمة", "fateer-salty", mL(160, 210)),
  item("fateer-shawarma-meat", "فطيرة شاورما لحمة", "fateer-salty", mL(175, 250)),
  item("roll-sausage", "فطير رول سجق", "fateer-salty", 150, { tagline: "الفطير الرول" }),
  item("roll-basterma", "فطير رول بسطرمة", "fateer-salty", 165, { tagline: "الفطير الرول" }),
  item("roll-crunchy", "فطير رول كرنشي تشيكن", "fateer-salty", 170, { tagline: "الفطير الرول" }),

  /* فطير حلو — the trays */
  item("tray-lotus", "فطيرة لوتس", "fateer-sweet", 110, { image: img.trayLotus, featured: true }),
  item("tray-pistachio", "فطيرة فستق", "fateer-sweet", 120, { image: img.trayPistachio }),
  item("tray-dubai", "فطيرة دبي", "fateer-sweet", 130, { image: img.trayDubai }),
  item("tray-berries", "فطيرة بلوبيري", "fateer-sweet", 110, { image: img.trayBerries }),
  item("tray-apple", "فطيرة تفاح", "fateer-sweet", 100, { image: img.trayApple }),
  item("tray-dates", "فطيرة بلح", "fateer-sweet", 100, { image: img.trayDates }),
  item("tray-duetto", "دويتو الفطير", "fateer-sweet", 240, { image: img.trayDuetto, description: "نصّين على مزاجك: تفاح، لوتس، شوكولاتة، بلح، كراميل." }),
  item("tray-four-seasons", "فطيرة الفورسيزون", "fateer-sweet", 250, { description: "أربع طعمات في صينية واحدة." }),
  /* فطير حلو — classic */
  item("sweet-sugar", "فطيرة سكر", "fateer-sweet", mL(80, 110)),
  item("sweet-custard", "فطيرة كاستر", "fateer-sweet", mL(80, 130)),
  item("sweet-cream-honey", "فطيرة قشطة وعسل", "fateer-sweet", mL(80, 150)),
  item("sweet-nuts", "فطيرة مشكل مكسرات", "fateer-sweet", mL(140, 250)),
  item("sweet-chocolate", "فطيرة شكولاتة", "fateer-sweet", mL(130, 220)),
  item("sweet-meshaltet", "فطيرة مشلتت", "fateer-sweet", mL(130, 220)),

  /* البيتزا */
  item("pizza-crunchy", "بيتزا كرانشي تشيكن", "pizza", sML(120, 150, 180), { tagline: "جديد" }),
  item("pizza-supreme", "بيتزا تشيكن سوبريم", "pizza", sML(130, 160, 210), { tagline: "جديد" }),
  item("pizza-ranch", "بيتزا تشيكن رانش", "pizza", sML(100, 130, 170), { tagline: "جديد" }),
  item("pizza-bbq", "بيتزا تشيكن باربيكيو", "pizza", sML(100, 130, 170), { tagline: "جديد" }),
  item("pizza-margherita", "بيتزا مرجريتا", "pizza", sML(70, 95, 140)),
  item("pizza-lahalebo", "بيتزا لهاليبو", "pizza", sML(110, 150, 200)),
  item("pizza-minced", "بيتزا مفروم", "pizza", sML(95, 125, 175)),
  item("pizza-cheese", "بيتزا مشكل جبن", "pizza", sML(100, 145, 195)),
  item("pizza-shawarma-chicken", "بيتزا شاورما فراخ", "pizza", sML(100, 150, 190)),
  item("pizza-shawarma-meat", "بيتزا شاورما لحمة", "pizza", sML(110, 160, 200)),

  /* حلويات */
  item("rice-pudding", "أرز باللبن", "desserts", 20),
  item("creme-caramel", "كريم كراميل", "desserts", 20),

  /* المشروبات */
  item("water-small", "مياه صغيرة", "drinks", 8),
  item("water-large", "مياه كبيرة", "drinks", 12),
  item("v-cola-can", "في كولا كانز", "drinks", 20),
  item("big-cola", "بيج كولا", "drinks", 10),
  item("slush", "سلاش", "drinks", 20),

  /* الإضافات */
  item("side-fries", "باكت بطاطس", "sides", 30),
  item("side-bread", "عيش لهاليبو", "sides", 10),
  item("side-hummus", "حمص", "sides", 8),
  item("side-lentils", "عدس", "sides", 8),
  item("side-ta2leya", "تقلية", "sides", 8),
  item("side-salsa", "صلصة", "sides", 8),
  item("side-shatta", "شطة", "sides", 1),
  item("side-da2a", "دقة", "sides", 1),
];

export const menuData: Menu = { categories, products };
