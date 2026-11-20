"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Search, SearchX, X } from "lucide-react";

import { ProductImage } from "@/components/shared/product-image";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  image: string | null;
  inStock: boolean;
};

type State = { status: "idle" | "loading" | "done" | "error"; items: Item[]; total: number };

const MIN_CHARS = 2;
const DEBOUNCE = 250;

/**
 * جستجوی زنده: همین‌جا (بدون رفتن به صفحهٔ دیگر) زیر کادر جستجو پنجرهٔ نتایج باز می‌شود.
 * Enter بدون انتخاب آیتم، به صفحهٔ کامل نتایج می‌رود.
 */
export function LiveSearch({
  placeholder,
  className,
  inputClassName,
  panelClassName,
}: {
  placeholder: string;
  className?: string;
  inputClassName?: string;
  panelClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [state, setState] = useState<State>({ status: "idle", items: [], total: 0 });

  const q = value.trim();
  const enough = q.length >= MIN_CHARS;

  // دریافت نتایج با debounce و لغو درخواست قبلی
  useEffect(() => {
    if (!enough) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setState((s) => ({ ...s, status: "loading" }));
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { items: Item[]; total: number };
        setState({ status: "done", items: data.items, total: data.total });
        setActive(-1);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState({ status: "error", items: [], total: 0 });
      }
    }, DEBOUNCE);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, enough]);

  // بستن با کلیک بیرون
  useEffect(() => {
    function onDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  // با تغییر صفحه پنجره بسته می‌شود
  useEffect(() => {
    setOpen(false);
    setValue("");
    setState({ status: "idle", items: [], total: 0 });
  }, [pathname]);

  const showPanel = open && enough;
  const items = state.items;

  function close() {
    setOpen(false);
    setActive(-1);
  }

  function submit() {
    if (!q) return;
    close();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      close();
      inputRef.current?.blur();
      return;
    }
    if (!showPanel || items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      close();
      router.push(`/products/${items[active].slug}`);
    }
  }

  const loading = enough && state.status === "loading";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <Search
          className="pointer-events-none absolute start-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-600"
          strokeWidth={1.7}
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="جستجو در محصولات"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          className={cn(
            "h-11 w-full rounded-full border border-line-200 bg-cream-100 ps-11 pe-10 text-sm outline-none transition-colors placeholder:text-muted-600 focus:border-cocoa-700 focus:bg-white [&::-webkit-search-cancel-button]:hidden",
            inputClassName,
          )}
        />
        {(value || loading) && (
          <button
            type="button"
            aria-label="پاک کردن"
            onClick={() => {
              setValue("");
              setState({ status: "idle", items: [], total: 0 });
              inputRef.current?.focus();
            }}
            className="absolute end-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-600 hover:bg-sand-200"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" strokeWidth={1.7} />}
          </button>
        )}
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className={cn(
            "absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-card border border-line-200 bg-white shadow-dl-lift animate-dl-fade",
            panelClassName,
          )}
        >
          {items.length > 0 ? (
            <>
              <ul className="max-h-[min(70vh,440px)] overflow-y-auto p-1.5">
                {items.map((p, i) => (
                  <li key={p.id} role="presentation">
                    <Link
                      id={`${listId}-${i}`}
                      role="option"
                      aria-selected={i === active}
                      href={`/products/${p.slug}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-md p-2 transition-colors",
                        i === active ? "bg-cream-100" : "hover:bg-cream-100",
                      )}
                    >
                      <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-sand-200">
                        {p.image && <ProductImage src={p.image} alt="" sizes="56px" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="block text-xs text-muted-600">{p.category}</span>
                      </span>
                      <span className="shrink-0 text-end text-sm">
                        {p.inStock ? (
                          <>
                            <b>{formatPrice(p.price)}</b>
                            <span className="text-xs text-muted-600"> تومان</span>
                            {p.compareAtPrice && (
                              <span className="block text-xs text-muted-600 line-through">
                                {formatPrice(p.compareAtPrice)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-muted-600">ناموجود</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/search?q=${encodeURIComponent(q)}`}
                onClick={close}
                className="flex items-center justify-between border-t border-line-200 bg-cream-100 px-4 py-3 text-sm font-semibold text-cocoa-700 hover:bg-sand-200"
              >
                مشاهدهٔ همهٔ {toPersianDigits(state.total)} نتیجه
                <ChevronLeft className="size-[18px]" strokeWidth={1.7} />
              </Link>
            </>
          ) : state.status === "done" ? (
            <div className="flex flex-col items-center gap-1.5 px-4 py-7 text-center">
              <SearchX className="size-7 text-muted-600" strokeWidth={1.5} />
              <b className="text-sm">محصولی با «{q}» پیدا نشد</b>
              <span className="text-xs text-muted-600">املای عبارت را بررسی کنید یا کلمهٔ کوتاه‌تری بنویسید.</span>
            </div>
          ) : state.status === "error" ? (
            <div className="px-4 py-6 text-center text-sm text-muted-600">جستجو در دسترس نیست؛ دوباره تلاش کنید.</div>
          ) : (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-600">
              <Loader2 className="size-4 animate-spin" />
              در حال جستجو…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
