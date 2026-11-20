"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { Field, TextInput } from "@/components/shop/form-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { formatPhoneDisplay, normalizeIranPhone, toLatinDigits, toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 5;
const RESEND_SECONDS = 120;

/** فقط مسیرهای داخلی سایت پذیرفته می‌شوند (جلوگیری از open redirect). */
function safeRedirect(path?: string) {
  return path && path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export function LoginForm({
  emailEnabled,
  smsEnabled,
  redirectTo,
}: {
  emailEnabled: boolean;
  smsEnabled: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const target = safeRedirect(redirectTo);
  const [mode, setMode] = useState<"phone" | "email">(smsEnabled ? "phone" : "email");

  const onSuccess = () => {
    router.push(target);
    router.refresh();
  };

  if (!emailEnabled && !smsEnabled) {
    return (
      <p className="text-center text-sm text-muted-600">
        در حال حاضر هیچ روش ورودی فعال نیست. لطفاً بعداً دوباره تلاش کنید.
      </p>
    );
  }

  return (
    <>
      {mode === "phone" ? <PhoneFlow onSuccess={onSuccess} /> : <EmailForm mode="login" onSuccess={onSuccess} />}

      {emailEnabled && smsEnabled && (
        <button
          type="button"
          onClick={() => setMode(mode === "phone" ? "email" : "phone")}
          className="text-center text-sm font-semibold text-cocoa-700 underline-offset-4 hover:underline"
        >
          {mode === "phone" ? "ورود با ایمیل و رمز عبور" : "ورود با شماره موبایل"}
        </button>
      )}
      <p className="text-center text-xs text-muted-600">
        ورود شما به معنای پذیرش{" "}
        <Link href="/terms" className="font-semibold text-cocoa-700 underline underline-offset-4">
          قوانین و مقررات دلانا
        </Link>{" "}
        است.
      </p>
    </>
  );
}

function PhoneFlow({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [e164, setE164] = useState("");
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function sendCode() {
    setLoading(true);
    setError(null);
    const normalized = normalizeIranPhone(phone);
    if (!/^\+989\d{9}$/.test(normalized)) {
      setLoading(false);
      setError("شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹).");
      return false;
    }
    const { error } = await authClient.phoneNumber.sendOtp({ phoneNumber: normalized });
    setLoading(false);
    if (error) {
      setError("ارسال کد ناموفق بود. کمی بعد دوباره تلاش کنید.");
      return false;
    }
    setE164(normalized);
    setLeft(RESEND_SECONDS);
    toast.success("کد تایید ارسال شد");
    return true;
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (await sendCode()) {
      setStep("code");
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => refs.current[0]?.focus(), 50);
    }
  }

  async function verify(code: string) {
    setLoading(true);
    setError(null);
    const { error } = await authClient.phoneNumber.verify({ phoneNumber: e164, code });
    setLoading(false);
    if (error) {
      setError("کد وارد شده صحیح نیست یا منقضی شده است.");
      setDigits(Array(OTP_LENGTH).fill(""));
      refs.current[0]?.focus();
      return;
    }
    toast.success("خوش آمدید");
    onSuccess();
  }

  function setDigit(i: number, raw: string) {
    const d = toLatinDigits(raw).replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
    if (next.every(Boolean)) void verify(next.join(""));
  }

  function onKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function onPaste(e: ClipboardEvent) {
    const text = toLatinDigits(e.clipboardData.getData("text")).replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    text.split("").forEach((c, idx) => (next[idx] = c));
    setDigits(next);
    refs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
    if (text.length === OTP_LENGTH) void verify(text);
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleSend} className="flex flex-col gap-5" noValidate>
        <Badge variant="new" className="self-start">مرحله ۱ از ۲</Badge>
        <div>
          <h1 className="t-h2">ورود یا ثبت‌نام</h1>
          <p className="t-sm mt-1 text-muted-600">
            شماره موبایل خود را وارد کنید تا کد تأیید برایتان پیامک شود.
          </p>
        </div>
        <Field label="شماره موبایل" htmlFor="ph" error={error}>
          <div className="flex h-14 items-center overflow-hidden rounded-field border border-line-200 bg-white focus-within:border-cocoa-700 focus-within:shadow-[0_0_0_3px_rgba(107,78,61,0.18)]">
            <TextInput
              id="ph"
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              autoFocus
              placeholder="0912 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-[54px] border-0 bg-transparent text-left text-[17px] tracking-[0.04em] shadow-none focus:shadow-none"
            />
            <span dir="ltr" className="flex h-full items-center border-s border-line-200 px-4 font-semibold text-muted-600">
              +98
            </span>
          </div>
        </Field>
        <Button type="submit" variant="pill" size="pill-lg" disabled={loading} className="w-full">
          {loading ? "در حال ارسال…" : "دریافت کد تأیید"}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (digits.every(Boolean)) void verify(digits.join(""));
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <Badge variant="new">مرحله ۲ از ۲</Badge>
        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setError(null);
          }}
          className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa-700"
        >
          ویرایش شماره
          <ChevronLeft className="size-[18px]" strokeWidth={1.7} />
        </button>
      </div>
      <div>
        <h2 className="t-h2">کد تأیید را وارد کنید</h2>
        <p className="t-sm mt-1 text-muted-600">
          کد {toPersianDigits(OTP_LENGTH)} رقمی به شمارهٔ{" "}
          <span dir="ltr" className="inline-block">{formatPhoneDisplay(e164)}</span> ارسال شد.
        </p>
      </div>
      <div dir="ltr" role="group" aria-label="کد تأیید" className="flex justify-center gap-2.5" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d ? toPersianDigits(d) : ""}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`رقم ${toPersianDigits(i + 1)}`}
            className={cn(
              "h-14 w-[46px] rounded-field border border-line-200 bg-ivory-50 text-center text-xl font-bold outline-none transition-shadow focus:border-cocoa-700 focus:shadow-[0_0_0_3px_rgba(107,78,61,0.18)] sm:h-16 sm:w-14 sm:text-2xl",
              error && "border-sale-700",
            )}
          />
        ))}
      </div>
      {error && <p role="alert" className="text-center text-sm text-sale-700">{error}</p>}
      <p className="t-sm text-center text-muted-600">
        {left > 0 ? (
          <>
            ارسال دوباره کد تا{" "}
            <b dir="ltr" className="inline-block">
              {toPersianDigits(`${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`)}
            </b>
          </>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => void sendCode()}
            className="font-semibold text-cocoa-700 underline underline-offset-4"
          >
            ارسال دوبارهٔ کد
          </button>
        )}
      </p>
      <Button type="submit" variant="pill" size="pill-lg" disabled={loading || !digits.every(Boolean)} className="w-full">
        {loading ? "در حال بررسی…" : "تأیید و ورود"}
      </Button>
    </form>
  );
}

export function EmailForm({
  mode,
  onSuccess,
}: {
  mode: "login" | "register";
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } =
      mode === "login"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });

    setLoading(false);
    if (error) {
      setError(mode === "login" ? "ایمیل یا رمز عبور اشتباه است." : (error.message ?? "ثبت‌نام ناموفق بود."));
      return;
    }
    toast.success(mode === "login" ? "خوش آمدید" : "ثبت‌نام با موفقیت انجام شد");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h1 className="t-h2">{mode === "login" ? "ورود با ایمیل" : "ساخت حساب کاربری"}</h1>
        <p className="t-sm mt-1 text-muted-600">
          {mode === "login" ? "ایمیل و رمز عبور خود را وارد کنید." : "اطلاعات خود را وارد کنید."}
        </p>
      </div>
      {mode === "register" && (
        <Field label="نام و نام‌خانوادگی" htmlFor="name">
          <TextInput id="name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
      )}
      <Field label="ایمیل" htmlFor="email">
        <TextInput id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="text-left" />
      </Field>
      <Field label="رمز عبور" htmlFor="password" hint={mode === "register" ? "حداقل ۸ کاراکتر" : undefined}>
        <TextInput id="password" type="password" dir="ltr" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} className="text-left" />
      </Field>
      {error && <p role="alert" className="text-sm text-sale-700">{error}</p>}
      <Button type="submit" variant="pill" size="pill-lg" disabled={loading} className="w-full">
        {loading ? "در حال پردازش…" : mode === "login" ? "ورود" : "ثبت‌نام"}
      </Button>
      <p className="text-center text-sm text-muted-600">
        {mode === "login" ? (
          <>
            حساب کاربری ندارید؟{" "}
            <Link href="/register" className="font-semibold text-cocoa-700 underline underline-offset-4">ثبت‌نام</Link>
          </>
        ) : (
          <>
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/login" className="font-semibold text-cocoa-700 underline underline-offset-4">ورود</Link>
          </>
        )}
      </p>
    </form>
  );
}
