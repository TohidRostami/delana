/**
 * داده‌ی نمونه‌ی دلانا — دسته‌بندی‌ها، سایزها و محصولات مطابق طرح سایت.
 * تصاویر، تصویرسازی‌های موقتی داخل public/seed هستند؛ بعد از راه‌اندازی
 * Object Storage از پنل ادمین (محصولات → ویرایش → تصاویر) با عکس واقعی
 * جایگزینشان کنید.
 */

export const CATEGORIES = [
  {
    slug: "manteau",
    title: "مانتو",
    description: "مانتوهای پاییزه و زمستانه دلانا؛ از مانتوهای پشمی بلند تا مدل‌های کتان روزمره.",
    image: "/seed/manteau-camel.svg",
    sortOrder: 1,
  },
  {
    slug: "coat",
    title: "پالتو و کت",
    description: "پالتوها و کت‌های خوش‌دوخت برای روزهای سرد.",
    image: "/seed/coat-cocoa.svg",
    sortOrder: 2,
  },
  {
    slug: "raincoat",
    title: "بارانی و کاپشن",
    description: "بارانی و کاپشن‌های سبک و گرم برای فصل‌های بارانی و سرد.",
    image: "/seed/trench-sand.svg",
    sortOrder: 3,
  },
  {
    slug: "party",
    title: "لباس مجلسی",
    description: "پیراهن‌های بلند با پارچه‌های لطیف برای شب‌های خاص.",
    image: "/seed/dress-wine.svg",
    sortOrder: 4,
  },
  {
    slug: "blouse",
    title: "شومیز",
    description: "شومیزهای سبک و شیک برای هر روز.",
    image: "/seed/shirt-ivory.svg",
    sortOrder: 5,
  },
  {
    slug: "knit",
    title: "بافت",
    description: "بافت‌های نرم و گرم با رنگ‌های خاکی.",
    image: "/seed/knit-caramel.svg",
    sortOrder: 6,
  },
  {
    slug: "pants-skirt",
    title: "شلوار و دامن",
    description: "شلوار و دامن‌هایی که با همه‌چیز ست می‌شوند.",
    image: "/seed/pants-brown.svg",
    sortOrder: 7,
  },
  {
    slug: "scarf",
    title: "شال و روسری",
    description: "شال و روسری‌های نخی و ابریشمی.",
    image: "/seed/scarf-caramel.svg",
    sortOrder: 8,
  },
  {
    slug: "bag",
    title: "کیف",
    description: "کیف‌های دستی و روزمره.",
    image: "/seed/bag-cocoa.svg",
    sortOrder: 9,
  },
];

// Sizes are store-wide and admin-managed (/admin/sizes). The description
// uses «عنوان: مقدار» pairs separated by «،» — the size-guide dialog on the
// product page turns those into table columns.
export const SIZES: { name: string; description: string; sortOrder: number }[] = [
  { name: "۳۶", description: "دور سینه: ۹۲، دور کمر: ۷۴، قد آستین: ۵۸، قد لباس: ۱۰۸", sortOrder: 1 },
  { name: "۳۸", description: "دور سینه: ۹۶، دور کمر: ۷۸، قد آستین: ۵۹، قد لباس: ۱۰۹", sortOrder: 2 },
  { name: "۴۰", description: "دور سینه: ۱۰۰، دور کمر: ۸۲، قد آستین: ۶۰، قد لباس: ۱۱۰", sortOrder: 3 },
  { name: "۴۲", description: "دور سینه: ۱۰۴، دور کمر: ۸۶، قد آستین: ۶۱، قد لباس: ۱۱۱", sortOrder: 4 },
  { name: "۴۴", description: "دور سینه: ۱۰۸، دور کمر: ۹۰، قد آستین: ۶۲، قد لباس: ۱۱۲", sortOrder: 5 },
  { name: "۴۶", description: "دور سینه: ۱۱۲، دور کمر: ۹۴، قد آستین: ۶۳، قد لباس: ۱۱۳", sortOrder: 6 },
  { name: "فری‌سایز", description: "مناسب همه‌ی اندازه‌ها", sortOrder: 7 },
];

type SeedColor = { name: string; hex: string; images?: string[] };

export type SeedProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  freeSize?: boolean;
  image: string;
  colors: SeedColor[];
  description: string;
  specifications: string;
  sku: string;
  /** stock overrides: "<colorIndex>:<sizeName>" → stock */
  stock?: Record<string, number>;
};

export const PRODUCTS: SeedProduct[] = [
  {
    slug: "mahoor-long-wool-manteau",
    name: "مانتو پشمی بلند ماهور",
    categorySlug: "manteau",
    price: 3_667_500,
    compareAtPrice: 4_890_000,
    isNew: true,
    isFeatured: true,
    image: "/seed/manteau-camel.svg",
    sku: "DL-140521",
    colors: [
      {
        name: "شتری",
        hex: "#c19a6b",
        images: [
          "/seed/manteau-camel.svg",
          "/seed/manteau-camel.svg",
          "/seed/coat-cocoa.svg",
          "/seed/knit-caramel.svg",
        ],
      },
      { name: "قهوه‌ای", hex: "#6b4e3d" },
      { name: "مشکی", hex: "#2b1f18" },
    ],
    description:
      "مانتو بلند ماهور با پارچه پشمی ضخیم و آستر ساتن، برای روزهای سرد پاییز و زمستان طراحی شده است. یقه کت‌دار، کمربند هم‌رنگ و دو جیب فلپ‌دار، ظاهری رسمی و در عین حال راحت به آن می‌دهند.\nاین مدل را می‌توانید با شلوار پاچه‌گشاد و شال نخی کرم ست کنید.",
    specifications:
      "جنس پارچه: ۷۰٪ پشم، ۳۰٪ پلی‌استر\nآستر: ساتن\nقد لباس: حدود ۱۱۰ سانتی‌متر\nفصل: پاییز و زمستان\nنگهداری: فقط خشک‌شویی\nتولید: ایران",
    stock: { "0:۳۸": 2, "0:۴۶": 0 },
  },
  {
    slug: "zhila-party-dress",
    name: "پیراهن مجلسی ژیلا",
    categorySlug: "party",
    price: 5_400_000,
    isNew: true,
    isFeatured: true,
    image: "/seed/dress-wine.svg",
    sku: "DL-140522",
    colors: [
      { name: "شرابی", hex: "#6d2e35" },
      { name: "مشکی", hex: "#2b1f18" },
    ],
    description:
      "پیراهن بلند ژیلا با پارچه کرپ ساتن و دامن گشاد، برای مهمانی‌ها و مراسم رسمی طراحی شده است. آستر نرم و زیپ پنهان، پوشیدن آن را راحت می‌کند.",
    specifications:
      "جنس پارچه: کرپ ساتن\nآستر: ویسکوز\nقد لباس: حدود ۱۳۵ سانتی‌متر\nنگهداری: خشک‌شویی\nتولید: ایران",
  },
  {
    slug: "termeh-crew-knit",
    name: "بافت یقه‌گرد ترمه",
    categorySlug: "knit",
    price: 1_690_000,
    isNew: true,
    isFeatured: true,
    image: "/seed/knit-caramel.svg",
    sku: "DL-140523",
    colors: [
      { name: "کاراملی", hex: "#a67c52" },
      { name: "کرم", hex: "#efe3d3" },
      { name: "زیتونی", hex: "#6f6a4b" },
    ],
    description:
      "بافت یقه‌گرد ترمه از نخ نرم و گرم بافته شده و روی پوست حس خوبی دارد. برش راحت آن زیر کت و پالتو هم جا می‌شود.",
    specifications:
      "جنس: ۶۰٪ اکریلیک، ۳۰٪ پشم، ۱۰٪ پلی‌آمید\nقد لباس: حدود ۶۸ سانتی‌متر\nنگهداری: شست‌وشو با دست در آب سرد\nتولید: ایران",
  },
  {
    slug: "printed-silk-scarf",
    name: "روسری ابریشم طرح‌دار",
    categorySlug: "scarf",
    price: 712_000,
    compareAtPrice: 890_000,
    freeSize: true,
    isFeatured: true,
    image: "/seed/scarf-caramel.svg",
    sku: "DL-140524",
    colors: [
      { name: "کاراملی", hex: "#a67c52" },
      { name: "شرابی", hex: "#6d2e35" },
    ],
    description:
      "روسری ابریشم طرح‌دار با لبه‌های دست‌دوز و رنگ‌های ماندگار. سبک و لطیف است و به راحتی روی سر و گردن می‌ماند.",
    specifications:
      "جنس: ابریشم\nابعاد: ۱۱۰ × ۱۱۰ سانتی‌متر\nنگهداری: خشک‌شویی\nتولید: ایران",
  },
  {
    slug: "sepid-belted-trench",
    name: "بارانی کمربنددار سپید",
    categorySlug: "raincoat",
    price: 3_184_000,
    compareAtPrice: 3_980_000,
    image: "/seed/trench-sand.svg",
    sku: "DL-140525",
    colors: [
      { name: "شنی", hex: "#d2b48c" },
      { name: "مشکی", hex: "#2b1f18" },
    ],
    description:
      "بارانی کمربنددار سپید با پارچه ضدآب سبک و دوخت دوردوز. یقه دوبل و دکمه‌های مات، آن را برای پاییز و بهار به انتخابی کلاسیک تبدیل می‌کند.",
    specifications:
      "جنس پارچه: گاباردین ضدآب\nآستر: پلی‌استر\nقد لباس: حدود ۱۰۵ سانتی‌متر\nتولید: ایران",
  },
  {
    slug: "raha-hooded-parka",
    name: "کاپشن کلاه‌دار رها",
    categorySlug: "raincoat",
    price: 4_350_000,
    image: "/seed/parka-olive.svg",
    sku: "DL-140526",
    colors: [
      { name: "زیتونی", hex: "#6f6a4b" },
      { name: "مشکی", hex: "#2b1f18" },
    ],
    description:
      "کاپشن کلاه‌دار رها با الیاف پرکننده سبک و گرم، برای روزهای سرد زمستان. کلاه جداشدنی و جیب‌های زیپ‌دار دارد.",
    specifications:
      "جنس رویه: میکرو ضدآب\nپرکننده: الیاف سبک\nقد لباس: حدود ۹۰ سانتی‌متر\nتولید: ایران",
  },
  {
    slug: "mahtab-diplomat-blouse",
    name: "شومیز یقه‌دیپلمات مهتاب",
    categorySlug: "blouse",
    price: 1_032_000,
    compareAtPrice: 1_290_000,
    image: "/seed/shirt-ivory.svg",
    sku: "DL-140527",
    colors: [
      { name: "عاجی", hex: "#f6efe6" },
      { name: "شنی", hex: "#d2b48c" },
    ],
    description:
      "شومیز یقه‌دیپلمات مهتاب از پارچه ویسکوز نرم دوخته شده و روی پوست سبک است. آستین بلند و دکمه‌های پوششی دارد.",
    specifications:
      "جنس پارچه: ویسکوز\nقد لباس: حدود ۷۲ سانتی‌متر\nنگهداری: شست‌وشو با دست\nتولید: ایران",
  },
  {
    slug: "fringed-cotton-shawl",
    name: "شال نخی ریشه‌دار",
    categorySlug: "scarf",
    price: 590_000,
    freeSize: true,
    image: "/seed/scarf-cream.svg",
    sku: "DL-140528",
    colors: [
      { name: "کرم", hex: "#efe3d3" },
      { name: "کاراملی", hex: "#a67c52" },
      { name: "شرابی", hex: "#6d2e35" },
    ],
    description:
      "شال نخی ریشه‌دار با بافت نرم و سبک، برای همراهی با مانتو و پالتو در فصل‌های سرد. ریشه‌های دست‌بافت آن را متمایز می‌کند.",
    specifications:
      "جنس: نخ خالص\nابعاد: ۲۰۰ × ۷۰ سانتی‌متر\nنگهداری: شست‌وشو با دست\nتولید: ایران",
  },
  {
    slug: "nil-double-crepe-coat",
    name: "پالتو دوبل کرپ نیل",
    categorySlug: "coat",
    price: 6_250_000,
    isFeatured: true,
    image: "/seed/coat-cocoa.svg",
    sku: "DL-140529",
    colors: [
      { name: "قهوه‌ای", hex: "#6b4e3d" },
      { name: "کرم", hex: "#efe3d3" },
    ],
    description:
      "پالتو دوبل نیل با پارچه کرپ پشمی و دکمه‌های دوردیف، برش بلند و ساده‌ای دارد که با همه‌چیز ست می‌شود.",
    specifications:
      "جنس پارچه: کرپ پشمی\nآستر: ساتن\nقد لباس: حدود ۱۱۵ سانتی‌متر\nنگهداری: فقط خشک‌شویی\nتولید: ایران",
  },
  {
    slug: "shabtab-party-dress",
    name: "پیراهن مجلسی شب‌تاب",
    categorySlug: "party",
    price: 4_750_000,
    image: "/seed/dress-black.svg",
    sku: "DL-140530",
    colors: [{ name: "مشکی", hex: "#2b1f18" }],
    description:
      "پیراهن مجلسی شب‌تاب با دامن کلوش و یقه هفت ملایم، برای شب‌های خاص که می‌خواهید ساده و دلنشین بدرخشید.",
    specifications:
      "جنس پارچه: کرپ حریر\nآستر: ساتن\nقد لباس: حدود ۱۳۰ سانتی‌متر\nنگهداری: خشک‌شویی\nتولید: ایران",
  },
  {
    slug: "ava-short-cream-blazer",
    name: "کت کوتاه کرم آوا",
    categorySlug: "coat",
    price: 2_750_000,
    image: "/seed/blazer-cream.svg",
    sku: "DL-140531",
    colors: [
      { name: "کرم", hex: "#efe3d3" },
      { name: "کاراملی", hex: "#a67c52" },
    ],
    description:
      "کت کوتاه آوا با یقه کلاسیک و دکمه‌های مات، روی مانتو و پیراهن هر دو خوب می‌نشیند و برای محل کار هم مناسب است.",
    specifications:
      "جنس پارچه: کرپ ضخیم\nآستر: ساتن\nقد لباس: حدود ۶۵ سانتی‌متر\nتولید: ایران",
  },
  {
    slug: "wide-leg-linen-pants",
    name: "شلوار پاچه‌گشاد کتان",
    categorySlug: "pants-skirt",
    price: 1_450_000,
    image: "/seed/pants-brown.svg",
    sku: "DL-140532",
    colors: [
      { name: "قهوه‌ای", hex: "#7d5a3a" },
      { name: "کرم", hex: "#efe3d3" },
      { name: "مشکی", hex: "#2b1f18" },
    ],
    description:
      "شلوار پاچه‌گشاد کتان با کمر بلند و پارچه‌ی خنک و راحت. با مانتو، شومیز و بافت هر سه ست می‌شود.",
    specifications:
      "جنس پارچه: ۸۰٪ کتان، ۲۰٪ ویسکوز\nقد شلوار: حدود ۱۰۵ سانتی‌متر\nنگهداری: قابل شست‌وشو در ماشین\nتولید: ایران",
  },
  {
    slug: "nasim-long-pleated-skirt",
    name: "دامن پلیسه بلند نسیم",
    categorySlug: "pants-skirt",
    price: 1_380_000,
    image: "/seed/skirt-sand.svg",
    sku: "DL-140533",
    colors: [
      { name: "شنی", hex: "#cdb393" },
      { name: "قهوه‌ای", hex: "#6b4e3d" },
    ],
    description:
      "دامن پلیسه بلند نسیم با پلیسه‌های ماندگار و کمر کشی، سبک و روان حرکت می‌کند.",
    specifications:
      "جنس پارچه: پلی‌استر کرپ\nقد دامن: حدود ۹۵ سانتی‌متر\nنگهداری: شست‌وشو با دست\nتولید: ایران",
  },
  {
    slug: "faux-leather-handbag",
    name: "کیف دستی چرم مصنوعی",
    categorySlug: "bag",
    price: 2_190_000,
    freeSize: true,
    image: "/seed/bag-cocoa.svg",
    sku: "DL-140534",
    colors: [
      { name: "قهوه‌ای", hex: "#6b4e3d" },
      { name: "مشکی", hex: "#2b1f18" },
    ],
    description:
      "کیف دستی از چرم مصنوعی با دوخت مقاوم و بند قابل تنظیم. جای کافی برای وسایل روزانه دارد.",
    specifications:
      "جنس: چرم مصنوعی\nابعاد: ۳۰ × ۲۲ × ۱۰ سانتی‌متر\nتولید: ایران",
  },
];
