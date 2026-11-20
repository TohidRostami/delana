import { prisma } from "@/lib/db";
import type { CategoryDTO, ProductDTO, ProductDetailDTO } from "@/lib/types";
import {
  SHOP_PER_PAGE,
  type SortOption,
} from "../product-constants";

export type { SortOption };

const ORDER_BY: Record<SortOption, Record<string, "asc" | "desc">[]> = {
  newest: [{ createdAt: "desc" }],
  "price-asc": [{ price: "asc" }],
  "price-desc": [{ price: "desc" }],
  bestseller: [{ isFeatured: "desc" }, { createdAt: "desc" }],
};

/** Everything the storefront shows: published and not archived. */
const VISIBLE = { isPublished: true, isArchived: false } as const;

const CARD_INCLUDE = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
  colors: { orderBy: { sortOrder: "asc" } },
} as const;

export async function getCategories(): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return categories as unknown as CategoryDTO[];
}

export type CategoryWithCount = CategoryDTO & { productCount: number };

/** Categories with the number of visible products in each (for filter counts). */
export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const categories = (await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: VISIBLE } } } },
  })) as unknown as (CategoryDTO & { _count: { products: number } })[];
  return categories.map(({ _count, ...c }) => ({
    ...c,
    productCount: _count.products,
  }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryDTO | null> {
  const category = await prisma.category.findUnique({ where: { slug } });
  return category as unknown as CategoryDTO | null;
}

export async function getFeaturedProducts(take = 4): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: { ...VISIBLE, isFeatured: true },
    include: CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take,
  });
  return products as unknown as ProductDTO[];
}

/** Newest visible products — «آخرین رسیده‌ها» on the home page and 404 suggestions. */
export async function getLatestProducts(take = 10): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: VISIBLE,
    include: CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take,
  });
  return products as unknown as ProductDTO[];
}

export type GetProductsOptions = {
  categorySlug?: string;
  sort?: SortOption;
  query?: string;
  page?: number;
  perPage?: number;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
};

export type GetProductsResult = {
  products: ProductDTO[];
  totalCount: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export { PER_PAGE_OPTIONS, DEFAULT_PER_PAGE, SHOP_PER_PAGE } from "../product-constants";

function buildWhere(options: GetProductsOptions) {
  const {
    categorySlug,
    query,
    sizes,
    colors,
    minPrice,
    maxPrice,
    inStockOnly,
    onSaleOnly,
  } = options;
  const trimmedQuery = query?.trim();

  return {
    ...VISIBLE,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(trimmedQuery
      ? {
          OR: [
            { name: { contains: trimmedQuery } },
            { description: { contains: trimmedQuery } },
            { category: { title: { contains: trimmedQuery } } },
          ],
        }
      : {}),
    ...(sizes?.length
      ? { variants: { some: { size: { name: { in: sizes } } } } }
      : {}),
    ...(colors?.length ? { colors: { some: { name: { in: colors } } } } : {}),
    ...(minPrice != null || maxPrice != null
      ? {
          price: {
            ...(minPrice != null ? { gte: minPrice } : {}),
            ...(maxPrice != null ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(inStockOnly ? { inStock: true } : {}),
    ...(onSaleOnly ? { compareAtPrice: { not: null } } : {}),
  };
}

export async function getProducts(
  options: GetProductsOptions = {},
): Promise<GetProductsResult> {
  const { sort = "newest" } = options;
  const perPage =
    options.perPage && options.perPage > 0 ? options.perPage : SHOP_PER_PAGE;
  const page = options.page && options.page > 0 ? options.page : 1;
  const where = buildWhere(options);

  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const safePage = Math.min(page, totalPages);

  const products = await prisma.product.findMany({
    where,
    include: CARD_INCLUDE,
    orderBy: ORDER_BY[sort],
    skip: (safePage - 1) * perPage,
    take: perPage,
  });

  return {
    products: products as unknown as ProductDTO[],
    totalCount,
    page: safePage,
    perPage,
    totalPages,
  };
}

export type ShopFacets = {
  sizes: { id: string; name: string }[];
  colors: { name: string; hexValue: string | null }[];
  maxPrice: number;
};

/** Options for the sidebar filters — only values that exist on visible products. */
export async function getShopFacets(categorySlug?: string): Promise<ShopFacets> {
  const productWhere = {
    ...VISIBLE,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };
  const [sizes, colors, top] = await Promise.all([
    prisma.size.findMany({
      where: { variants: { some: { product: productWhere } } },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.color.findMany({
      where: { product: productWhere },
      orderBy: { sortOrder: "asc" },
      select: { name: true, hexValue: true },
    }),
    prisma.product.findFirst({
      where: productWhere,
      orderBy: { price: "desc" },
      select: { price: true },
    }),
  ]);

  const seen = new Set<string>();
  const uniqueColors = (colors as { name: string; hexValue: string | null }[]).filter(
    (c) => (seen.has(c.name) ? false : (seen.add(c.name), true)),
  );
  const maxPrice = Math.ceil(((top as { price: number } | null)?.price ?? 1_000_000) / 100_000) * 100_000;

  return {
    sizes: sizes as { id: string; name: string }[],
    colors: uniqueColors,
    maxPrice,
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailDTO | null> {
  const product = await prisma.product.findFirst({
    where: { slug, ...VISIBLE },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      variants: {
        include: { size: true, color: true },
        orderBy: [
          { color: { sortOrder: "asc" } },
          { size: { sortOrder: "asc" } },
        ],
      },
    },
  });
  return product as unknown as ProductDetailDTO | null;
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  take = 4,
): Promise<ProductDTO[]> {
  const sameCategory = await prisma.product.findMany({
    where: { ...VISIBLE, categoryId, NOT: { id: productId } },
    include: CARD_INCLUDE,
    orderBy: { createdAt: "desc" },
    take,
  });
  let result = sameCategory as unknown as ProductDTO[];

  // Top up from the rest of the catalogue so the row is always full.
  if (result.length < take) {
    const rest = await prisma.product.findMany({
      where: {
        ...VISIBLE,
        NOT: { id: { in: [productId, ...result.map((p) => p.id)] } },
      },
      include: CARD_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: take - result.length,
    });
    result = [...result, ...(rest as unknown as ProductDTO[])];
  }
  return result;
}

export async function searchProducts(
  query: string,
  take = 8,
): Promise<ProductDTO[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return (
    await getProducts({ query: trimmed, perPage: take })
  ).products;
}
