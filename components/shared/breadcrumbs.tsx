import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="مسیر صفحه"
      className="flex flex-wrap items-center gap-2 py-4 text-[13px] text-muted-600 sm:py-5"
    >
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span className="opacity-60">/</span>}
          {it.href ? (
            <Link href={it.href} className="transition-colors hover:text-espresso-900">
              {it.label}
            </Link>
          ) : (
            <b className="font-semibold text-espresso-900">{it.label}</b>
          )}
        </span>
      ))}
    </nav>
  );
}
