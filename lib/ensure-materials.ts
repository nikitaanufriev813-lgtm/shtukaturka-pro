import { prisma } from "@/lib/prisma";
import { DEFAULT_MIXES, DEFAULT_PRIMERS } from "@/lib/default-materials";

export async function getOrSeedMixes() {
  let mixes = await prisma.plasterMix.findMany({ orderBy: { name: "asc" } });
  if (mixes.length === 0) {
    await prisma.plasterMix.createMany({ data: DEFAULT_MIXES });
    mixes = await prisma.plasterMix.findMany({ orderBy: { name: "asc" } });
  }
  return mixes;
}

export async function getOrSeedPrimers() {
  let primers = await prisma.primer.findMany({ orderBy: { name: "asc" } });
  if (primers.length === 0) {
    await prisma.primer.createMany({ data: DEFAULT_PRIMERS });
    primers = await prisma.primer.findMany({ orderBy: { name: "asc" } });
  }
  return primers;
}
