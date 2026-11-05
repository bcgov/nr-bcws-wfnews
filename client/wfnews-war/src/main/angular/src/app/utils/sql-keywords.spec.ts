import { hasSQLKeywords } from '@app/utils';

describe('hasSQLKeywords', () => {
  it('finds a standalone SQL word', () => {
    expect(hasSQLKeywords('drop table reports')).toBe(true);
    expect(hasSQLKeywords('{"note":"Delete from x"}')).toBe(true);
  });

  it('allows a word followed by a star', () => {
    expect(hasSQLKeywords('select * please')).toBe(false);
  });

  it('allows the letters inside a longer word', () => {
    expect(hasSQLKeywords('selection of updated creates')).toBe(false);
  });
});
