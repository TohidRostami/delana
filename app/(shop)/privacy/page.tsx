import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: `سیاست حفظ حریم خصوصی کاربران ${siteConfig.site.name}.`,
  alternates: { canonical: "/privacy" },
};

const name = siteConfig.site.name;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="حریم خصوصی"
      intro={`چه اطلاعاتی را از شما نگه می‌داریم و برای چه کاری.`}
      sections={[
        { title: "اطلاعاتی که ذخیره می‌کنیم", body: [`برای ساخت حساب و ارسال سفارش، ${name} شمارهٔ موبایل، نام و آدرس تحویل شما (و در صورت ثبت، ایمیل) را نگه می‌دارد.`] },
        { title: "استفاده از اطلاعات", body: ["این اطلاعات فقط برای ورود به حساب، پردازش و ارسال سفارش، پیگیری و پشتیبانی استفاده می‌شود. اطلاعات شما فروخته یا برای شخص ثالث بازاریابی منتقل نمی‌شود."] },
        { title: "پرداخت", body: ["پرداخت در صفحهٔ درگاه بانکی انجام می‌شود و اطلاعات کارت شما در هیچ بخشی از این سایت ذخیره نمی‌شود."] },
        { title: "پیامک", body: ["کد ورود و اطلاعیه‌های مربوط به سفارش به شمارهٔ موبایل شما پیامک می‌شود. پیامک تبلیغاتی ارسال نمی‌کنیم."] },
        { title: "حذف اطلاعات", body: [`برای حذف حساب یا اصلاح اطلاعات، از صفحهٔ «تماس با ما» با ${name} در ارتباط باشید.`] },
      ]}
    />
  );
}
