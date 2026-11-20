"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Field, TextInput } from "@/components/shop/form-ui";
import { Panel } from "@/components/shop/ui-bits";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/(shop)/account/actions";

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [values, setValues] = useState({ name, email });
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await updateProfile(values);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success("اطلاعات ذخیره شد");
      router.refresh();
    });
  }

  return (
    <Panel>
      <form onSubmit={submit} noValidate>
        <div className="grid gap-[18px] sm:grid-cols-2">
          <Field label="نام و نام خانوادگی" htmlFor="p-name">
            <TextInput id="p-name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} autoComplete="name" />
          </Field>
          {phone && (
            <Field label="شماره موبایل" htmlFor="p-phone" hint="شمارهٔ ورود قابل تغییر نیست.">
              <TextInput id="p-phone" dir="ltr" readOnly value={phone} className="bg-sand-200/50 text-right" />
            </Field>
          )}
          <Field label="ایمیل (اختیاری)" htmlFor="p-email" error={error}>
            <TextInput id="p-email" type="email" dir="ltr" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} placeholder="name@example.com" className="text-right" autoComplete="email" />
          </Field>
        </div>
        <div className="mt-5">
          <Button type="submit" variant="pill" size="pill" disabled={pending}>
            {pending ? "در حال ذخیره…" : "ذخیره تغییرات"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
