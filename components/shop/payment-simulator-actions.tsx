"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { completeSimulatedPayment } from "@/app/(shop)/checkout/actions";

export function PaymentSimulatorActions({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState<"success" | "fail" | null>(null);

  async function handle(outcome: "success" | "fail") {
    setLoading(outcome);
    window.location.href = await completeSimulatedPayment(orderId, outcome);
  }

  return (
    <div className="mt-8 flex flex-col gap-3">
      <Button variant="pill" size="pill" onClick={() => handle("success")} disabled={!!loading}>
        {loading === "success" ? "در حال پردازش…" : "شبیه‌سازی پرداخت موفق"}
      </Button>
      <Button variant="pill-outline" size="pill" onClick={() => handle("fail")} disabled={!!loading}>
        {loading === "fail" ? "در حال پردازش…" : "شبیه‌سازی پرداخت ناموفق"}
      </Button>
    </div>
  );
}
