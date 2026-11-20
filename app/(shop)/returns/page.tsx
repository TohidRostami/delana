import type { Metadata } from "next";
import { LegalPage } from "@/components/shared/legal-page";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "بازگشت کالا",
  description: `شرایط و مراحل بازگشت یا تعویض کالا در ${siteConfig.site.name}.`,
  alternates: { canonical: "/returns" },
};

const days = siteConfig.shipping.returnDays;

export default function ReturnsPage() {
  return (
    <LegalPage
      title="بازگشت کالا"
      intro={`ضمانت بازگشت ${days} روزه؛ بدون پرسش اضافه.`}
      sections={[
        { title: "شرایط بازگشت", body: [`تا ${days} روز پس از تحویل، اگر کالا پوشیده یا شسته نشده و برچسب آن جدا نشده باشد، می‌توانید درخواست بازگشت یا تعویض ثبت کنید.`] },
        { title: "مراحل", body: ["۱. با ما تماس بگیرید و شمارهٔ سفارش را اعلام کنید.", "۲. کالا را در بسته‌بندی اصلی و همراه فاکتور ارسال کنید.", "۳. پس از بررسی، مبلغ به همان کارت پرداخت‌کننده بازگردانده یا کالای جایگزین ارسال می‌شود."] },
        { title: "هزینهٔ ارسال برگشت", body: ["اگر کالا ایراد داشته یا اشتباه ارسال شده باشد، هزینهٔ بازگشت با ما است؛ در سایر موارد هزینهٔ ارسال برگشت با مشتری است."] },
        { title: "کالاهای غیرقابل بازگشت", body: ["لباس زیر، کالاهای استفاده‌شده یا آسیب‌دیده و کالاهای فروخته‌شده در حراج نهایی قابل بازگشت نیستند."] },
      ]}
    />
  );
}
