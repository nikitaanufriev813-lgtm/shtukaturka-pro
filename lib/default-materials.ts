// Базовые смеси и грунтовки — сидируются в БД один раз (см. prisma/seed.ts
// и app/api/mixes/route.ts, который досоздаёт недостающие при первом обращении).
// Расход указан по паспортам производителей (кг/м² при заданной толщине слоя);
// при отсутствии официальных данных для конкретной толщины использована линейная
// экстраполяция от паспортного расхода "на 1мм слоя".

export const DEFAULT_MIXES = [
  {
    name: "Jatbay",
    brand: "Jatbay",
    consumption10mm: 8.5,
    consumption15mm: 12.75,
    consumption20mm: 17.0,
    consumption25mm: 21.25,
    bagWeightKg: 30,
    pricePerBag: 550,
  },
  {
    name: "Magma",
    brand: "Magma",
    consumption10mm: 9.0,
    consumption15mm: 13.5,
    consumption20mm: 18.0,
    consumption25mm: 22.5,
    bagWeightKg: 30,
    pricePerBag: 520,
  },
  {
    name: "Volma",
    brand: "Волма Слой",
    consumption10mm: 8.5,
    consumption15mm: 12.5,
    consumption20mm: 17.0,
    consumption25mm: 21.5,
    bagWeightKg: 30,
    pricePerBag: 480,
  },
  {
    name: "Knauf MP 75",
    brand: "Knauf",
    consumption10mm: 8.5,
    consumption15mm: 12.5,
    consumption20mm: 17.0,
    consumption25mm: 21.0,
    bagWeightKg: 30,
    pricePerBag: 560,
  },
];

export const DEFAULT_PRIMERS = [
  {
    name: "Бетоноконтакт",
    consumptionPerM2: 0.3,
    unit: "кг",
    containerVolume: 20,
    pricePerContainer: 2400,
  },
  {
    name: "Knauf Tiefengrund",
    consumptionPerM2: 0.12,
    unit: "л",
    containerVolume: 10,
    pricePerContainer: 1300,
  },
  {
    name: "Mittelgrund",
    consumptionPerM2: 0.18,
    unit: "л",
    containerVolume: 10,
    pricePerContainer: 1450,
  },
];
