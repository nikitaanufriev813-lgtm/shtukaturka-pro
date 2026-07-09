import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const client = await prisma.user.upsert({
    where: { phone: "+79000000001" },
    update: {},
    create: {
      phone: "+79000000001",
      email: "client@example.com",
      name: "Иван Клиентов",
      passwordHash,
      role: "CLIENT",
    },
  });

  const foreman = await prisma.user.upsert({
    where: { phone: "+79000000002" },
    update: {},
    create: {
      phone: "+79000000002",
      email: "foreman@example.com",
      name: "Пётр Бригадиров",
      passwordHash,
      role: "FOREMAN",
    },
  });

  await prisma.user.upsert({
    where: { phone: "+79000000003" },
    update: {},
    create: {
      phone: "+79000000003",
      email: "admin@example.com",
      name: "Мария Менеджер",
      passwordHash,
      role: "ADMIN",
    },
  });

  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      foremanId: foreman.id,
      address: "г. Москва, ул. Примерная, д. 10, кв. 25",
      area: 85,
      roomsCount: 4,
      plannedEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      rooms: {
        create: [
          { name: "Гостиная", area: 25, progressPercent: 60, status: "IN_PROGRESS" },
          { name: "Кухня", area: 15, progressPercent: 100, status: "DONE" },
          { name: "Спальня 1", area: 18, progressPercent: 30, status: "IN_PROGRESS" },
          { name: "Спальня 2", area: 17, progressPercent: 0, status: "PENDING" },
        ],
      },
    },
    include: { rooms: true },
  });

  const livingRoom = project.rooms.find((r) => r.name === "Гостиная")!;

  await prisma.report.create({
    data: {
      projectId: project.id,
      roomId: livingRoom.id,
      authorId: foreman.id,
      wallsArea: 12,
      ceilingArea: 3,
      waterShutOff: true,
      doorsClosed: true,
      furnitureProtected: true,
      comment: "Нанесена штукатурка на две стены, потолок частично готов.",
    },
  });

  console.log("Сид-данные успешно загружены ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
