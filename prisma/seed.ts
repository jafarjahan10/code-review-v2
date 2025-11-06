import { PrismaClient, UserType, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin users
  const adminPassword = await bcrypt.hash("Echologyx@1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@echologyx.com" },
    update: {},
    create: {
      email: "admin@echologyx.com",
      name: "Admin User",
      password: adminPassword,
      userType: UserType.ADMIN,
      adminRole: AdminRole.ADMIN,
    },
  });

  const userAdmin = await prisma.user.upsert({
    where: { email: "user@echologyx.com" },
    update: {},
    create: {
      email: "user@echologyx.com",
      name: "Regular Admin",
      password: adminPassword,
      userType: UserType.ADMIN,
      adminRole: AdminRole.USER,
    },
  });

  // Create candidate user
  const candidatePassword = await bcrypt.hash("candidate123", 10);
  const candidate = await prisma.user.upsert({
    where: { email: "candidate@example.com" },
    update: {},
    create: {
      email: "candidate@example.com",
      name: "Test Candidate",
      password: candidatePassword,
      userType: UserType.CANDIDATE,
    },
  });

  console.log("Seed data created:");
  console.log("Admin:", admin.email, "- password: Echologyx@1234");
  console.log("User Admin:", userAdmin.email, "- password: Echologyx@1234");
  console.log("Candidate:", candidate.email, "- password: candidate123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
