import {
  parseProhibitionCategories,
  prohibitionCategoryCqlFilter,
} from './prohibition-categories';

describe('prohibition-categories', () => {
  describe('parseProhibitionCategories', () => {
    it('parses all three categories from comma-separated CATEGORY values', () => {
      expect(parseProhibitionCategories('Category 1,2,3')).toEqual({
        isCat1: true,
        isCat2: true,
        isCat3: true,
      });
    });

    it('parses subsets of categories', () => {
      expect(parseProhibitionCategories('Category 2,3')).toEqual({
        isCat1: false,
        isCat2: true,
        isCat3: true,
      });
      expect(parseProhibitionCategories('Category 1')).toEqual({
        isCat1: true,
        isCat2: false,
        isCat3: false,
      });
      expect(parseProhibitionCategories('Category 2')).toEqual({
        isCat1: false,
        isCat2: true,
        isCat3: false,
      });
      expect(parseProhibitionCategories('Category 3')).toEqual({
        isCat1: false,
        isCat2: false,
        isCat3: true,
      });
    });

    it('handles extra or missing whitespace around Category and commas', () => {
      expect(parseProhibitionCategories('Category 1, 2, 3')).toEqual({
        isCat1: true,
        isCat2: true,
        isCat3: true,
      });
      expect(parseProhibitionCategories('Category1,2')).toEqual({
        isCat1: true,
        isCat2: true,
        isCat3: false,
      });
    });

    it('ignores category numbers other than 1, 2, and 3', () => {
      expect(parseProhibitionCategories('Category 1,2,3,4,5')).toEqual({
        isCat1: true,
        isCat2: true,
        isCat3: true,
      });
      expect(parseProhibitionCategories('Category 4')).toEqual({
        isCat1: false,
        isCat2: false,
        isCat3: false,
      });
      expect(parseProhibitionCategories('Category 4,5')).toEqual({
        isCat1: false,
        isCat2: false,
        isCat3: false,
      });
      expect(parseProhibitionCategories('Category 10,12')).toEqual({
        isCat1: false,
        isCat2: false,
        isCat3: false,
      });
    });

    it('returns all false for empty or missing input', () => {
      expect(parseProhibitionCategories(null)).toEqual({
        isCat1: false,
        isCat2: false,
        isCat3: false,
      });
      expect(parseProhibitionCategories(undefined)).toEqual({
        isCat1: false,
        isCat2: false,
        isCat3: false,
      });
      expect(parseProhibitionCategories('')).toEqual({
        isCat1: false,
        isCat2: false,
        isCat3: false,
      });
    });
  });

  describe('prohibitionCategoryCqlFilter', () => {
    it('builds the expected CQL filters for categories 1, 2, and 3', () => {
      expect(prohibitionCategoryCqlFilter(1)).toBe(
        "strMatches(CATEGORY, '.*(^|[^0-9])1([^0-9]|$).*') = true",
      );
      expect(prohibitionCategoryCqlFilter(2)).toBe(
        "strMatches(CATEGORY, '.*(^|[^0-9])2([^0-9]|$).*') = true",
      );
      expect(prohibitionCategoryCqlFilter(3)).toBe(
        "strMatches(CATEGORY, '.*(^|[^0-9])3([^0-9]|$).*') = true",
      );
    });

    it('matches exact category numbers and rejects multi-digit or other category numbers', () => {
      const extractRegex = (cat: 1 | 2 | 3) => {
        const cql = prohibitionCategoryCqlFilter(cat);
        const match = cql.match(/strMatches\(CATEGORY, '([^']+)'\)/);
        return new RegExp(`^(?:${match[1]})$`);
      };

      const re1 = extractRegex(1);
      const re2 = extractRegex(2);
      const re3 = extractRegex(3);

      expect(re1.test('Category 1,2,3')).toBe(true);
      expect(re1.test('Category 1,2,3,4,5')).toBe(true);
      expect(re1.test('Category 2,3')).toBe(false);
      expect(re1.test('Category 4,5')).toBe(false);
      expect(re1.test('Category 12')).toBe(false);

      expect(re2.test('Category 2,3')).toBe(true);
      expect(re2.test('Category 12')).toBe(false);

      expect(re3.test('Category 1,2,3')).toBe(true);
      expect(re3.test('Category 2,3')).toBe(true);
      expect(re3.test('Category 4,5')).toBe(false);
      expect(re3.test('Category 13')).toBe(false);
    });
  });
});
