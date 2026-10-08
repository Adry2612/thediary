import type { RepertoirePartPracticeStats } from "@/lib/repertoire-analytics";
import type {
  RepertoireItem,
  RepertoireItemKind,
} from "@/types/practice";

export type RepertoireProgressFilter = "all" | "learning" | "learned";
export type RepertoireSortOrder =
  | "original"
  | "recent"
  | "title"
  | "artist"
  | "practice";

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
  kind: "all" | RepertoireItemKind;
  progress: RepertoireProgressFilter;
  sort: RepertoireSortOrder;
};

type PracticeStatsByItem = Map<
  string,
  Map<string, RepertoirePartPracticeStats>
>;

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
  practiceStats: PracticeStatsByItem,
) {
  return item.parts.reduce(
    (total, part) =>
      total +
      (practiceStats.get(item.id)?.get(part.id)?.practiceSeconds ?? 0),
    0,
  );
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
  if (first.kind !== second.kind) return first.kind === "song" ? -1 : 1;
  if (first.kind === "lick") return compareTitles(first, second);

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
  practiceStats: PracticeStatsByItem,
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

export function getFilteredRepertoireItems(
  items: RepertoireItem[],
  filters: RepertoireItemFilters,
  practiceStats: PracticeStatsByItem,
) {
  const filteredItems = items.filter(
    (item) =>
      (filters.kind === "all" || item.kind === filters.kind) &&
      matchesProgress(item, filters.progress) &&
      matchesSearch(item, filters.query),
  );
  return sortItems(filteredItems, filters.sort, practiceStats);
}

export function getRecentRepertoireItems(items: RepertoireItem[]) {
  return items.slice().sort(compareByRecentUpdate).slice(0, 4);
}
