import type {
  RepertoireItemPracticeStats,
} from "./repertoire-analytics.ts";
import type { RepertoireItem, GuitarType } from "@/types/practice";

export type RepertoireProgressFilter = "all" | "learning" | "learned";
export type RepertoireSortOrder =
  | "original"
  | "recent"
  | "title"
  | "artist"
  | "practice";

export type GuitarTypeFilter = "all" | GuitarType;
export type FutureLearnFilter = "all" | "future" | "current";

const REPERTOIRE_PROGRESS_FILTERS: RepertoireProgressFilter[] = [
  "all",
  "learning",
  "learned",
];
const REPERTOIRE_SORT_ORDERS: RepertoireSortOrder[] = [
  "original",
  "recent",
  "title",
  "artist",
  "practice",
];

export function isRepertoireProgressFilter(
  value: string,
): value is RepertoireProgressFilter {
  return REPERTOIRE_PROGRESS_FILTERS.some((filter) => filter === value);
}

export function isRepertoireSortOrder(
  value: string,
): value is RepertoireSortOrder {
  return REPERTOIRE_SORT_ORDERS.some((order) => order === value);
}

export type RepertoireItemFilters = {
  query: string;
  progress: RepertoireProgressFilter;
  sort: RepertoireSortOrder;
  guitarType: GuitarTypeFilter;
  futureLearn: FutureLearnFilter;
};

type ItemPracticeStatsByItem = Map<string, RepertoireItemPracticeStats>;

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function matchesSearch(item: RepertoireItem, query: string) {
  const terms = normalizeSearchText(query).trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const searchableText = normalizeSearchText(
    [item.title, item.artist ?? "", ...item.parts.map((part) => part.name)].join(
      " ",
    ),
  );
  return terms.every((term) => searchableText.includes(term));
}

function isLearned(item: RepertoireItem) {
  return item.parts.length > 0 && item.parts.every((part) => part.learned);
}

function matchesProgress(
  item: RepertoireItem,
  progress: RepertoireProgressFilter,
) {
  if (progress === "all") return true;
  return progress === "learned" ? isLearned(item) : !isLearned(item);
}

function getPracticeSeconds(
  item: RepertoireItem,
  practiceStats: ItemPracticeStatsByItem,
) {
  return practiceStats.get(item.id)?.practiceSeconds ?? 0;
}

function compareTitles(first: RepertoireItem, second: RepertoireItem) {
  return first.title.localeCompare(second.title, "es", {
    sensitivity: "base",
  });
}

function compareByRecentUpdate(
  first: RepertoireItem,
  second: RepertoireItem,
) {
  return (
    second.updatedAt.localeCompare(first.updatedAt) ||
    compareTitles(first, second)
  );
}

function compareArtists(first: RepertoireItem, second: RepertoireItem) {
  const firstArtist = first.artist?.trim();
  const secondArtist = second.artist?.trim();
  if (!firstArtist && secondArtist) return 1;
  if (firstArtist && !secondArtist) return -1;

  return (
    (firstArtist ?? "").localeCompare(secondArtist ?? "", "es", {
      sensitivity: "base",
    }) || compareTitles(first, second)
  );
}

function sortItems(
  items: RepertoireItem[],
  sort: RepertoireSortOrder,
  practiceStats: ItemPracticeStatsByItem,
) {
  if (sort === "original") return items;
  if (sort === "title") return items.slice().sort(compareTitles);
  if (sort === "artist") return items.slice().sort(compareArtists);
  if (sort === "practice") {
    return items.slice().sort(
      (first, second) =>
        getPracticeSeconds(second, practiceStats) -
          getPracticeSeconds(first, practiceStats) ||
        compareTitles(first, second),
    );
  }
  return items.slice().sort(compareByRecentUpdate);
}

function matchesGuitarType(item: RepertoireItem, filter: GuitarTypeFilter) {
  if (filter === "all") return true;
  return item.guitarType === filter;
}

function matchesFutureLearn(item: RepertoireItem, filter: FutureLearnFilter) {
  if (filter === "all") return true;
  if (filter === "future") return item.isFutureLearn === true;
  return item.isFutureLearn !== true;
}

export function getFilteredRepertoireItems(
  items: RepertoireItem[],
  filters: RepertoireItemFilters,
  practiceStats: ItemPracticeStatsByItem,
) {
  const filteredItems = items.filter(
    (item) =>
      item.kind === "song" &&
      matchesProgress(item, filters.progress) &&
      matchesSearch(item, filters.query) &&
      matchesGuitarType(item, filters.guitarType) &&
      matchesFutureLearn(item, filters.futureLearn),
  );
  return sortItems(filteredItems, filters.sort, practiceStats);
}

export function getRecentRepertoireItems(items: RepertoireItem[]) {
  return items
    .filter((item) => item.kind === "song")
    .sort(compareByRecentUpdate)
    .slice(0, 4);
}
