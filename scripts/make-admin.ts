import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("استفاده: npm run make-admin -- email@example.com");
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`کاربری با ایمیل ${email} پیدا نشد. ابتدا ثبت‌نام کنید.`);
    process.exit(1);
  }
  await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
  console.log(`${email} اکنون ادمین است.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
