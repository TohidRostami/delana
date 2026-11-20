"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, X } from "lucide-react";

import { Panel } from "@/components/shop/ui-bits";

const KEY = "delana-recent-searches";
const MAX = 6;

function readRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((x) => x !== q)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function SearchBox({
  initialQuery,
  placeholder,
  popular,
}: {
  initialQuery: string;
  placeholder: string;
  popular: string[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setValue(initialQuery);
    if (initialQuery) saveRecent(initialQuery);
    setRecent(readRecent());
  }, [initialQuery]);

  function go(q: string) {
    const t = q.trim();
    if (!t) return;
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  function clearRecent() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setRecent([]);
  }

  return (
    <>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(value);
        }}
      >
        <label htmlFor="q" className="sr-only">جستجو</label>
        <div className="flex h-14 items-center gap-3 rounded-full border-[1.5px] border-cocoa-700 bg-white px-[18px] shadow-[0_0_0_4px_rgba(107,78,61,.12)] sm:h-16 sm:px-6">
          <Search className="size-6 shrink-0 text-cocoa-700" strokeWidth={1.7} />
          <input
            id="q"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            autoFocus={!initialQuery}
            enterKeyHint="search"
            autoComplete="off"
            className="w-full min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none placeholder:text-muted-600 sm:text-lg"
          />
          {value && (
            <button
              type="button"
              aria-label="پاک کردن"
              onClick={() => {
                setValue("");
                document.getElementById("q")?.focus();
              }}
              className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-sand-200"
            >
              <X className="size-[18px]" strokeWidth={1.7} />
            </button>
          )}
        </div>
      </form>

      {!initialQuery && (
        <div className="mt-5 grid gap-3.5 md:grid-cols-2">
          {recent.length > 0 && (
            <Panel>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="t-h3">جستجوهای اخیر شما</h2>
                <button type="button" onClick={clearRecent} className="text-xs font-semibold text-muted-600 hover:text-cocoa-700">
                  پاک کردن
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {recent.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => go(r)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-200 px-3.5 text-[13px] font-medium hover:bg-sand-200 sm:h-10 sm:px-[18px] sm:text-sm"
                  >
                    <Clock className="size-4" strokeWidth={1.7} />
                    {r}
                  </button>
                ))}
              </div>
            </Panel>
          )}
          <Panel>
            <h2 className="t-h3 mb-4">جستجوهای پرطرفدار</h2>
            <div className="flex flex-wrap gap-2.5">
              {popular.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => go(r)}
                  className="inline-flex h-9 items-center rounded-full bg-sand-200 px-3.5 text-[13px] font-medium text-cocoa-700 hover:bg-sand-300 sm:h-10 sm:px-[18px] sm:text-sm"
                >
                  {r}
                </button>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </>
  );
}
