import { NextResponse } from "next/server";

import { getProducts } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

const LIMIT = 6;

/** یکسان‌سازی حروف عربی (ي/ك) با فارسی تا جستجو با کیبوردهای مختلف جواب بدهد. */
function normalize(q: string) {
  return q
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export async function GET(req: Request) {
  const q = normalize(new URL(req.url).searchParams.get("q") ?? "");
  if (q.length < 2) return NextResponse.json({ items: [], total: 0 });

  try {
    const { products, totalCount } = await getProducts({
      query: q,
      perPage: LIMIT,
    });
    return NextResponse.json(
      {
        total: totalCount,
        items: products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category.title,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          image: p.images[0]?.url ?? null,
          inStock: p.inStock,
        })),
      },
      { headers: { "Cache-Control": "private, max-age=30" } },
    );
  } catch {
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}
