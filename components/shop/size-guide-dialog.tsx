"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseSizeMeasures, toPersianDigits } from "@/lib/format";

type SizeInfo = { name: string; description: string | null };

const TIPS = [
  { title: "دور سینه", body: "متر را از برجسته‌ترین قسمت سینه، صاف دور بدن بچرخانید." },
  { title: "دور کمر", body: "باریک‌ترین قسمت کمر را بدون فشار اندازه بگیرید." },
  { title: "قد آستین", body: "از سرشانه تا مچ دست، با دست کمی خم‌شده." },
];

export function SizeGuideDialog({
  open,
  onOpenChange,
  productName,
  sizes,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  productName: string;
  sizes: SizeInfo[];
}) {
  const rows = sizes.map((s) => ({ name: s.name, measures: parseSizeMeasures(s.description) }));
  const columns = Array.from(new Set(rows.flatMap((r) => r.measures.map((m) => m.label))));
  const structured = columns.length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] animate-dl-fade bg-espresso-900/50" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[88vh] flex-col gap-[18px] overflow-auto rounded-t-3xl bg-white p-4 py-[22px] shadow-[0_30px_70px_-24px_rgba(43,31,24,0.55)] animate-dl-sheet outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-h-[calc(100vh-48px)] sm:w-[calc(100%-48px)] sm:max-w-[700px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:animate-dl-pop sm:rounded-xl sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="t-h2">راهنمای سایز</Dialog.Title>
              <Dialog.Description className="text-sm text-muted-600">
                {productName}
                {structured && " · اندازه‌ها به سانتی‌متر"}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="بستن راهنما"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand-200 transition-colors hover:bg-sand-300"
            >
              <X className="size-5" strokeWidth={1.7} />
            </Dialog.Close>
          </div>

          {sizes.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-600">
              اطلاعات ابعاد برای سایزهای این محصول ثبت نشده است.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-line-200">
              <table className="w-full min-w-0 text-center text-sm sm:text-[15px]">
                <thead className="bg-cream-100">
                  <tr>
                    <th className="px-1.5 py-2.5 font-bold sm:p-3.5">سایز</th>
                    {structured ? (
                      columns.map((c) => (
                        <th key={c} className="px-1.5 py-2.5 font-bold sm:p-3.5">{c}</th>
                      ))
                    ) : (
                      <th className="px-1.5 py-2.5 font-bold sm:p-3.5">توضیح</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.name} className="border-t border-line-100">
                      <td className="px-1.5 py-2.5 font-bold sm:p-3.5">{toPersianDigits(r.name)}</td>
                      {structured ? (
                        columns.map((c) => (
                          <td key={c} className="px-1.5 py-2.5 sm:p-3.5">
                            {toPersianDigits(r.measures.find((m) => m.label === c)?.value ?? "—")}
                          </td>
                        ))
                      ) : (
                        <td className="px-1.5 py-2.5 text-muted-600 sm:p-3.5">
                          {sizes[i].description ?? "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="grid gap-2.5 sm:grid-cols-3">
            {TIPS.map((t) => (
              <div key={t.title} className="rounded-field bg-cream-100 p-3.5 text-[13px]">
                <b className="mb-1 block text-sm">{t.title}</b>
                <span className="text-muted-600">{t.body}</span>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-warn-700">
            اگر اندازه‌تان بین دو سایز است، سایز بزرگ‌تر را انتخاب کنید.
          </p>
          <Dialog.Close asChild>
            <Button variant="pill" size="pill" className="w-full">متوجه شدم</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
