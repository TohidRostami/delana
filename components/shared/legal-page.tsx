import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro?: string;
  sections: { title: string; body: string[] }[];
}) {
  return (
    <div className="wrap pb-14">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: title }]} />
      <div className="mx-auto max-w-[760px]">
        <h1 className="t-h1">{title}</h1>
        {intro && <p className="mt-2 text-muted-600">{intro}</p>}
        <div className="mt-6 rounded-md border border-dashed border-line-200 bg-cream-100 px-4 py-3 text-xs leading-6 text-muted-600">
          این متن نمونهٔ پایه است؛ پیش از انتشار نهایی آن را با فرایندهای واقعی بوتیک تطبیق دهید و در صورت امکان با مشورت حقوقی تکمیل کنید.
        </div>
        <div className="mt-8 flex flex-col gap-4">
          {sections.map((s) => (
            <section key={s.title} className="rounded-lg bg-cream-100 p-5 sm:p-6">
              <h2 className="t-h3 mb-2.5">{s.title}</h2>
              <div className="flex flex-col gap-2 text-sm leading-[1.95] text-muted-600">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
