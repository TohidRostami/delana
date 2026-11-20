import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/queries/settings";
import { RegisterClient } from "./register-client";

export const metadata: Metadata = { title: "ثبت‌نام" };

export default async function RegisterPage() {
  const settings = await getSiteSettings();

  if (!settings.emailLoginEnabled) {
    return (
      <div className="text-center">
        <h1 className="t-h2 mb-3">ثبت‌نام با ایمیل غیرفعال است</h1>
        <p className="text-sm leading-7 text-muted-600">
          می‌توانید از{" "}
          <Link href="/login" className="font-semibold text-cocoa-700 underline underline-offset-4">
            ورود با شماره موبایل
          </Link>{" "}
          استفاده کنید؛ حساب شما خودکار ساخته می‌شود.
        </p>
      </div>
    );
  }

  return <RegisterClient />;
}
