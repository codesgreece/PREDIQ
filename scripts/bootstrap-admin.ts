import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { writeAuditLog } from "../src/lib/audit";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD before bootstrapping.",
    );
  }
  if (password.length < 12) {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.");
  }

  const existingCount = await prisma.adminUser.count();
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existingCount > 0 && !existing) {
    throw new Error(
      "An administrator already exists. Public registration is disabled. Reset via controlled DB access if needed.",
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, isActive: true },
    create: {
      email,
      passwordHash,
      name: "Administrator",
      isActive: true,
    },
  });

  await writeAuditLog({
    actorId: user.id,
    action: "BOOTSTRAP",
    entityType: "AdminUser",
    entityId: user.id,
    summary: `Bootstrapped administrator ${email}`,
  });

  console.log(`Administrator ready: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
