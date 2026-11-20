"use client";

import { useState, useTransition } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/empty-state";
import { Field, SelectInput, TextArea, TextInput } from "@/components/shop/form-ui";
import { Panel } from "@/components/shop/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addressSchema } from "@/lib/address";
import { toLatinDigits, toPersianDigits } from "@/lib/format";
import { IRAN_PROVINCES } from "@/lib/iran-provinces";
import { deleteAddress, saveAddress, setDefaultAddress } from "@/app/(shop)/account/actions";

export type AddressDTO = {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string;
  isDefault: boolean;
};

const EMPTY = { fullName: "", phone: "", province: "تهران", city: "", addressLine: "", postalCode: "" };

export function AddressList({ addresses }: { addresses: AddressDTO[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function open(a?: AddressDTO) {
    setForm(a ? { fullName: a.fullName, phone: a.phone, province: a.province, city: a.city, addressLine: a.addressLine, postalCode: a.postalCode } : EMPTY);
    setErrors({});
    setEditing(a?.id ?? "new");
  }

  function set(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = addressSchema.safeParse({ ...form, phone: toLatinDigits(form.phone), postalCode: toLatinDigits(form.postalCode) });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] ||= i.message;
      setErrors(next);
      return;
    }
    start(async () => {
      const res = await saveAddress(editing === "new" ? null : editing, parsed.data);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("آدرس ذخیره شد");
      setEditing(null);
      router.refresh();
    });
  }

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    start(async () => {
      const res = await fn();
      if (!res.ok) {
        toast.error(res.error ?? "خطا");
        return;
      }
      toast.success(success);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="t-h1">آدرس‌های من</h1>
        {editing === null && (
          <Button variant="pill" size="pill-sm" onClick={() => open()}>
            <Plus strokeWidth={1.7} />
            آدرس جدید
          </Button>
        )}
      </div>

      {editing !== null && (
        <Panel>
          <h2 className="t-h3 mb-[18px]">{editing === "new" ? "افزودن آدرس جدید" : "ویرایش آدرس"}</h2>
          <form onSubmit={submit} noValidate>
            <div className="grid gap-[18px] sm:grid-cols-2">
              <Field label="نام و نام خانوادگی گیرنده" htmlFor="a-name" error={errors.fullName}>
                <TextInput id="a-name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} aria-invalid={!!errors.fullName} />
              </Field>
              <Field label="شماره موبایل" htmlFor="a-phone" error={errors.phone}>
                <TextInput id="a-phone" dir="ltr" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="text-right" aria-invalid={!!errors.phone} />
              </Field>
              <Field label="استان" htmlFor="a-province" error={errors.province}>
                <SelectInput id="a-province" value={form.province} onChange={(e) => set("province", e.target.value)}>
                  {IRAN_PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </SelectInput>
              </Field>
              <Field label="شهر" htmlFor="a-city" error={errors.city}>
                <TextInput id="a-city" value={form.city} onChange={(e) => set("city", e.target.value)} aria-invalid={!!errors.city} />
              </Field>
              <Field label="نشانی کامل" htmlFor="a-line" error={errors.addressLine} className="sm:col-span-2">
                <TextArea id="a-line" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} placeholder="خیابان، کوچه، پلاک، واحد" aria-invalid={!!errors.addressLine} />
              </Field>
              <Field label="کد پستی" htmlFor="a-postal" error={errors.postalCode} hint="۱۰ رقم، بدون خط تیره">
                <TextInput id="a-postal" dir="ltr" inputMode="numeric" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} className="text-right" aria-invalid={!!errors.postalCode} />
              </Field>
            </div>
            <div className="mt-5 flex gap-3">
              <Button type="submit" variant="pill" size="pill" disabled={pending}>ذخیره آدرس</Button>
              <Button type="button" variant="pill-outline" size="pill" onClick={() => setEditing(null)}>انصراف</Button>
            </div>
          </form>
        </Panel>
      )}

      {addresses.length === 0 && editing === null ? (
        <EmptyState icon={MapPin} title="هنوز آدرسی ثبت نکرده‌اید" description="با ثبت آدرس، تسویه حساب سریع‌تر انجام می‌شود." actionLabel="" />
      ) : (
        <div className="grid gap-3.5 md:grid-cols-2">
          {addresses.map((a) => (
            <article key={a.id} className="flex flex-col gap-3 rounded-lg bg-cream-100 p-5">
              <div className="flex items-center justify-between gap-2">
                <b>{a.fullName}</b>
                {a.isDefault && <Badge variant="dark">پیش‌فرض</Badge>}
              </div>
              <p className="text-sm leading-[1.9] text-muted-600">
                {a.province}، {a.city}، {a.addressLine}
                <br />
                کد پستی {toPersianDigits(a.postalCode)} · {toPersianDigits(a.phone)}
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button variant="pill-outline" size="sm" className="rounded-full" onClick={() => open(a)}>
                  <Pencil strokeWidth={1.7} />ویرایش
                </Button>
                {!a.isDefault && (
                  <Button variant="pill-ghost" size="sm" className="rounded-full" disabled={pending} onClick={() => run(() => setDefaultAddress(a.id), "آدرس پیش‌فرض تغییر کرد")}>
                    پیش‌فرض شود
                  </Button>
                )}
                <Button variant="pill-ghost" size="sm" className="rounded-full text-sale-700" disabled={pending} onClick={() => confirm("این آدرس حذف شود؟") && run(() => deleteAddress(a.id), "آدرس حذف شد")}>
                  <Trash2 strokeWidth={1.7} />حذف
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
