"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addressSchema } from "@/lib/address";
import { toLatinDigits } from "@/lib/format";

type Result = { ok: true } | { ok: false; error: string };

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

function normalize(input: Record<string, unknown>) {
  return {
    ...input,
    phone: typeof input.phone === "string" ? toLatinDigits(input.phone) : input.phone,
    postalCode: typeof input.postalCode === "string" ? toLatinDigits(input.postalCode) : input.postalCode,
  };
}

export async function saveAddress(id: string | null, input: Record<string, unknown>): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "ابتدا وارد حساب کاربری شوید." };

  const parsed = addressSchema.safeParse(normalize(input));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "اطلاعات معتبر نیست." };
  const { isDefault, ...data } = parsed.data;

  if (id) {
    const owned = await prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
    if (!owned) return { ok: false, error: "آدرس پیدا نشد." };
  }
  const count = await prisma.address.count({ where: { userId } });
  const makeDefault = !!isDefault || (!id && count === 0);

  if (makeDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  if (id) {
    await prisma.address.update({ where: { id }, data: { ...data, ...(makeDefault ? { isDefault: true } : {}) } });
  } else {
    await prisma.address.create({ data: { ...data, userId, isDefault: makeDefault } });
  }
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "ابتدا وارد حساب کاربری شوید." };
  const owned = await prisma.address.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return { ok: false, error: "آدرس پیدا نشد." };
  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  await prisma.address.update({ where: { id }, data: { isDefault: true } });
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "ابتدا وارد حساب کاربری شوید." };
  const owned = (await prisma.address.findFirst({
    where: { id, userId },
    select: { id: true, isDefault: true },
  })) as { id: string; isDefault: boolean } | null;
  if (!owned) return { ok: false, error: "آدرس پیدا نشد." };

  // آدرسی که سفارشی به آن وصل است حذف نمی‌شود (سفارش به آن ارجاع دارد).
  const used = await prisma.order.count({ where: { addressId: id } });
  if (used > 0) {
    return { ok: false, error: "این آدرس در سفارش‌های قبلی استفاده شده و قابل حذف نیست." };
  }
  await prisma.address.delete({ where: { id } });
  if (owned.isDefault) {
    const next = (await prisma.address.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true } })) as { id: string } | null;
    if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  revalidatePath("/account/addresses");
  return { ok: true };
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "نام را وارد کنید.").max(80),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("ایمیل معتبر نیست.")]),
});

export async function updateProfile(input: { name: string; email: string }): Promise<Result> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "ابتدا وارد حساب کاربری شوید." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "اطلاعات معتبر نیست." };
  const { name, email } = parsed.data;

  const data: { name: string; email?: string } = { name };
  const current = session.user.email;
  if (email && email !== current) {
    const clash = await prisma.user.findFirst({ where: { email, NOT: { id: session.user.id } }, select: { id: true } });
    if (clash) return { ok: false, error: "این ایمیل قبلاً برای حساب دیگری ثبت شده است." };
    data.email = email;
  }
  await prisma.user.update({ where: { id: session.user.id }, data });
  revalidatePath("/account", "layout");
  return { ok: true };
}
