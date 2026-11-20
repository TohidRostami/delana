import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { CATEGORIES, SIZES, PRODUCTS } from "./seed-data";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

/** Small deterministic PRNG so every seed run produces the same stock. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

async function main() {
  console.log("→ در حال پاک کردن داده‌های قبلی...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.color.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.size.deleteMany();
  await prisma.discountCode.deleteMany();

  console.log("→ در حال ساخت سایزها...");
  const sizeByName = new Map<string, string>();
  for (const size of SIZES) {
    const created = await prisma.size.create({ data: size });
    sizeByName.set(size.name, created.id);
  }

  console.log("→ در حال ساخت دسته‌بندی‌ها...");
  const categoryBySlug = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const created = await prisma.category.create({ data: cat });
    categoryBySlug.set(cat.slug, created.id);
  }

  console.log("→ در حال ساخت محصولات...");
  const random = rng(1405);
  const letterSizes = SIZES.filter((s) => s.name !== "فری‌سایز").map((s) => s.name);

  for (const [index, p] of PRODUCTS.entries()) {
    const categoryId = categoryBySlug.get(p.categorySlug);
    if (!categoryId) continue;

    const product = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        specifications: p.specifications,
        sku: p.sku,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        categoryId,
        isNew: p.isNew ?? false,
        isFeatured: p.isFeatured ?? false,
        // newest first: earlier items in the list are the most recent
        createdAt: new Date(Date.now() - index * 36 * 60 * 60 * 1000),
      },
    });

    const sizeNames = p.freeSize ? ["فری‌سایز"] : letterSizes;

    for (const [ci, color] of p.colors.entries()) {
      const created = await prisma.color.create({
        data: {
          productId: product.id,
          name: color.name,
          hexValue: color.hex,
          sortOrder: ci,
        },
      });

      for (const [ii, url] of (color.images ?? [p.image]).entries()) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            colorId: created.id,
            url,
            alt: p.name,
            sortOrder: ii,
          },
        });
      }

      for (const sizeName of sizeNames) {
        const override = p.stock?.[`${ci}:${sizeName}`];
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            colorId: created.id,
            sizeId: sizeByName.get(sizeName)!,
            stock: override ?? Math.floor(random() * 9) + 2,
          },
        });
      }
    }
  }

  console.log("→ در حال ساخت کد تخفیف نمونه...");
  await prisma.discountCode.create({
    data: { code: "DELANA10", type: "PERCENTAGE", value: 10, isActive: true },
  });

  console.log("→ در حال ساخت تنظیمات پیش‌فرض سایت...");
  const settings = {
    freeShippingThreshold: 2_000_000,
    standardShippingCost: 95_000,
    tipaxShippingCost: 120_000,
  };
  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    update: settings,
    create: { id: "singleton", ...settings },
  });

  console.log("✓ seed کامل شد.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
