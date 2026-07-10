// Калькулятор материалов для механизированной штукатурки.
// Все формулы — инженерные приближения на основе стандартной строительной практики,
// параметры (шаг маяков, ширина откоса и т.д.) вынесены в константы ниже —
// их можно скорректировать под конкретную бригаду/регион.

export const CALC_CONSTANTS = {
  // Стандартная длина профиля маяка, м (обычно продаются по 3 или 2.5 м)
  BEACON_PROFILE_LENGTH_M: 3,
  // Шаг между маяками при машинном нанесении, м
  BEACON_SPACING_M: 1.0,
  // Средняя ширина откоса (глубина проёма), м — для перевода погонных метров в площадь
  SLOPE_AVERAGE_WIDTH_M: 0.15,
  // Ширина полосы под армирующую сетку на стыке, м (с каждой стороны шва)
  MESH_JOINT_WIDTH_M: 0.2,
  // Стандартная длина рулона сетки, м
  MESH_ROLL_LENGTH_M: 50,
  // Технологический запас (на подрезку, потери), доля
  WASTE_FACTOR: 0.1,
};

export type ThicknessMm = 10 | 15 | 20 | 25;

export interface MixLike {
  id?: string;
  name: string;
  consumption10mm: number;
  consumption15mm: number;
  consumption20mm: number;
  consumption25mm: number;
  bagWeightKg: number;
  pricePerBag?: number | null;
}

export interface PrimerLike {
  id?: string;
  name: string;
  consumptionPerM2: number;
  unit: string;
  containerVolume: number;
  pricePerContainer?: number | null;
}

export interface RoomCalcInput {
  wallArea: number; // м²
  windowArea?: number; // м²
  perimeter?: number; // м
  height?: number; // м
  slopeLinearMeters?: number; // погонные метры откосов
  meshJointsMeters?: number; // погонные метры стыков
  thicknessMm: ThicknessMm;
  mix: MixLike;
  primer?: PrimerLike | null;
}

export interface CalcLineItem {
  key: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface RoomCalcResult {
  netWallArea: number; // площадь стен за вычетом окон
  mixConsumptionKgPerM2: number;
  mixTotalKg: number;
  mixBags: number;
  primerLiters: number;
  primerContainers: number;
  beaconsCount: number;
  beaconsProfiles: number;
  meshRolls: number;
  slopeAreaM2: number;
  slopeMixKg: number;
  lineItems: CalcLineItem[];
  totalCost: number;
}

function mixConsumptionAt(mix: MixLike, thicknessMm: ThicknessMm): number {
  switch (thicknessMm) {
    case 10:
      return mix.consumption10mm;
    case 15:
      return mix.consumption15mm;
    case 20:
      return mix.consumption20mm;
    case 25:
      return mix.consumption25mm;
  }
}

/**
 * Полный расчёт материалов для одной комнаты по введённым параметрам.
 */
export function calculateRoom(input: RoomCalcInput): RoomCalcResult {
  const {
    wallArea,
    windowArea = 0,
    perimeter = 0,
    height = 2.7,
    slopeLinearMeters = 0,
    meshJointsMeters = 0,
    thicknessMm,
    mix,
    primer,
  } = input;

  const netWallArea = Math.max(0, wallArea - windowArea);

  // --- Штукатурная смесь на стены ---
  const mixConsumptionKgPerM2 = mixConsumptionAt(mix, thicknessMm);
  const mixTotalKgRaw = netWallArea * mixConsumptionKgPerM2;
  const mixTotalKg = mixTotalKgRaw * (1 + CALC_CONSTANTS.WASTE_FACTOR);
  const mixBags = Math.ceil(mixTotalKg / mix.bagWeightKg);

  // --- Откосы (считаются отдельно, погонные метры → площадь → кг той же смеси) ---
  const slopeAreaM2 = slopeLinearMeters * CALC_CONSTANTS.SLOPE_AVERAGE_WIDTH_M;
  const slopeMixKg = slopeAreaM2 * mixConsumptionKgPerM2 * (1 + CALC_CONSTANTS.WASTE_FACTOR);
  const slopeBags = Math.ceil(slopeMixKg / mix.bagWeightKg);

  // --- Грунтовка (расход не зависит от толщины штукатурки) ---
  const primerConsumption = primer?.consumptionPerM2 ?? 0;
  const primerLitersRaw = netWallArea * primerConsumption;
  const primerLiters = primerLitersRaw * (1 + CALC_CONSTANTS.WASTE_FACTOR);
  const primerContainers = primer
    ? Math.ceil(primerLiters / primer.containerVolume)
    : 0;

  // --- Маяки (по периметру стен) ---
  const beaconsCount =
    perimeter > 0
      ? Math.ceil(perimeter / CALC_CONSTANTS.BEACON_SPACING_M) + 1
      : 0;
  const profilesPerLine = Math.ceil(height / CALC_CONSTANTS.BEACON_PROFILE_LENGTH_M);
  const beaconsProfiles = beaconsCount * profilesPerLine;

  // --- Армирующая сетка на стыки/переходы ---
  const meshAreaM2 = meshJointsMeters * CALC_CONSTANTS.MESH_JOINT_WIDTH_M * 2; // с двух сторон шва
  const meshRolls =
    meshJointsMeters > 0
      ? Math.ceil(meshJointsMeters / CALC_CONSTANTS.MESH_ROLL_LENGTH_M)
      : 0;

  const lineItems: CalcLineItem[] = [];

  if (mixBags > 0) {
    lineItems.push({
      key: "mix",
      description: `${mix.name} (мешки по ${mix.bagWeightKg} кг, слой ${thicknessMm} мм)`,
      quantity: mixBags,
      unit: "мешок",
      unitPrice: mix.pricePerBag ?? 0,
      total: mixBags * (mix.pricePerBag ?? 0),
    });
  }

  if (slopeBags > 0) {
    lineItems.push({
      key: "slope_mix",
      description: `${mix.name} на откосы (${slopeLinearMeters} п.м.)`,
      quantity: slopeBags,
      unit: "мешок",
      unitPrice: mix.pricePerBag ?? 0,
      total: slopeBags * (mix.pricePerBag ?? 0),
    });
  }

  if (primer && primerContainers > 0) {
    lineItems.push({
      key: "primer",
      description: `${primer.name} (канистры по ${primer.containerVolume} ${primer.unit})`,
      quantity: primerContainers,
      unit: "канистра",
      unitPrice: primer.pricePerContainer ?? 0,
      total: primerContainers * (primer.pricePerContainer ?? 0),
    });
  }

  if (beaconsProfiles > 0) {
    lineItems.push({
      key: "beacons",
      description: `Маяки штукатурные ${CALC_CONSTANTS.BEACON_PROFILE_LENGTH_M} м`,
      quantity: beaconsProfiles,
      unit: "шт",
      unitPrice: 0,
      total: 0,
    });
  }

  if (meshRolls > 0) {
    lineItems.push({
      key: "mesh",
      description: `Армирующая сетка на стыки (рулон ${CALC_CONSTANTS.MESH_ROLL_LENGTH_M} м)`,
      quantity: meshRolls,
      unit: "рулон",
      unitPrice: 0,
      total: 0,
    });
  }

  const totalCost = lineItems.reduce((sum, item) => sum + item.total, 0);

  return {
    netWallArea,
    mixConsumptionKgPerM2,
    mixTotalKg,
    mixBags,
    primerLiters,
    primerContainers,
    beaconsCount,
    beaconsProfiles,
    meshRolls,
    slopeAreaM2,
    slopeMixKg,
    lineItems,
    totalCost,
  };
}

/**
 * Агрегирует расчёты по нескольким комнатам в единую смету объекта.
 */
export function aggregateProjectEstimate(
  roomResults: { roomName: string; result: RoomCalcResult }[]
): CalcLineItem[] {
  const merged = new Map<string, CalcLineItem>();

  for (const { roomName, result } of roomResults) {
    for (const item of result.lineItems) {
      const key = `${roomName} — ${item.description}`;
      merged.set(key, { ...item, description: key });
    }
  }

  return Array.from(merged.values());
}
