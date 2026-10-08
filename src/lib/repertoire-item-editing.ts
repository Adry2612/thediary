import type { RepertoireItem, RepertoirePart } from "@/types/practice";

interface RepertoireBpmParseResult {
  isValid: boolean;
  value: number | null;
}

export function parseRepertoireBpm(value: string): RepertoireBpmParseResult {
  const normalizedValue = value.trim();
  if (!normalizedValue) return { isValid: true, value: null };

  const parsedValue = Number(normalizedValue);
  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 0 ||
    parsedValue > 400
  ) {
    return { isValid: false, value: null };
  }

  return { isValid: true, value: parsedValue };
}

export function createRepertoirePart(
  id: string,
  sequenceNumber: number,
): RepertoirePart {
  return {
    id,
    name: `Parte ${sequenceNumber}`,
    learned: false,
    masteredBpm: null,
    targetBpm: null,
  };
}

export function updateRepertoirePart(
  item: RepertoireItem,
  partId: string,
  changes: Partial<RepertoirePart>,
  updatedAt: string,
): RepertoireItem {
  return {
    ...item,
    parts: item.parts.map((part) =>
      part.id === partId ? { ...part, ...changes } : part,
    ),
    updatedAt,
  };
}
