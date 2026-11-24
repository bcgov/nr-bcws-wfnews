export interface ProhibitionCategories {
  isCat1: boolean;
  isCat2: boolean;
  isCat3: boolean;
}

/**
 * Parses comma-separated category numbers from the Bans and Prohibitions
 * CATEGORY field (e.g. "Category 1,2,3"). Any numbers other than 1, 2, 3
 * are ignored.
 */
export function parseProhibitionCategories(
  category?: string | null,
): ProhibitionCategories {
  if (!category) {
    return { isCat1: false, isCat2: false, isCat3: false };
  }
  const tokens = new Set(
    category
      .replace(/category/gi, '')
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part === '1' || part === '2' || part === '3'),
  );
  return {
    isCat1: tokens.has('1'),
    isCat2: tokens.has('2'),
    isCat3: tokens.has('3'),
  };
}

/**
 * Builds a GeoServer CQL filter matching a single prohibition category number
 * (1, 2, or 3) inside the comma-separated CATEGORY field (e.g. "Category 1,2,3")
 * while ignoring any other numbers (e.g. 4, 5, 12).
 */
export function prohibitionCategoryCqlFilter(category: 1 | 2 | 3): string {
  return `CATEGORY IS NOT NULL AND strMatches(CATEGORY, '.*(^|[^0-9])${category}([^0-9]|$).*') = true`;
}
