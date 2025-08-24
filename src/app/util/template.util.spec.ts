import { TemplateUtil } from './template.util';

describe('TemplateUtil', () => {
  it('should create an instance', () => {
    expect(new TemplateUtil()).toBeTruthy();
  });

  describe('replace', () => {
    it('returns original string when no replacements are provided', () => {
      const tpl = '{host}/x';
      expect(TemplateUtil.replace(tpl)).toBe(tpl);
    });

    it('returns empty string for null/undefined template', () => {
      expect(TemplateUtil.replace(null as any)).toBe('');
      expect(TemplateUtil.replace(undefined as any)).toBe('');
    });

    it('handles empty template', () => {
      expect(TemplateUtil.replace('')).toBe('');
      expect(
        TemplateUtil.replace('', { token: '{x}', value: 'y', all: true })
      ).toBe('');
    });

    it('does a single replacement when all=false', () => {
      const tpl = '{repo}/{repo}/{repo}';
      const out = TemplateUtil.replace(tpl, { token: '{repo}', value: 'r', all: false });
      expect(out).toBe('r/{repo}/{repo}');
    });

    it('replaces all occurrences when all=true', () => {
      const tpl = '{repo}/{repo}/{repo}';
      const out = TemplateUtil.replace(tpl, { token: '{repo}', value: 'r', all: true });
      expect(out).toBe('r/r/r');
    });

    it('handles multiple replacements as varargs', () => {
      const tpl = '{host}/repos/{owner}/{repo}/commits/{branch}';
      const out = TemplateUtil.replace(
        tpl,
        { token: '{host}', value: 'https://api.github.com', all: true },
        { token: '{owner}', value: 'octocat', all: true },
        { token: '{repo}', value: 'hello-world', all: true },
        { token: '{branch}', value: 'main', all: true }
      );
      expect(out).toBe('https://api.github.com/repos/octocat/hello-world/commits/main');
    });

    it('accepts an array of replacements', () => {
      const tpl = '{a}-{b}-{c}';
      const out = TemplateUtil.replace(tpl, [
        { token: '{a}', value: 'A', all: true },
        { token: '{b}', value: 'B', all: true },
        { token: '{c}', value: 'C', all: true },
      ]);
      expect(out).toBe('A-B-C');
    });

    it('accepts mixed varargs and arrays (flattens one level)', () => {
      const tpl = '{a}-{b}-{c}-{b}';
      const out = TemplateUtil.replace(
        tpl,
        { token: '{a}', value: 'A', all: true },
        [
          { token: '{b}', value: 'B', all: true },
          { token: '{c}', value: 'C', all: true },
        ]
      );
      expect(out).toBe('A-B-C-B');
    });

    it('ignores null/undefined replacement entries and empty tokens', () => {
      const tpl = '{x}-{y}';
      const out = TemplateUtil.replace(
        tpl,
        null as any,
        undefined as any,
        { token: '', value: 'NO', all: true } as any,
        { token: '{x}', value: 'X', all: true },
        [undefined as any, { token: '{y}', value: 'Y', all: true }]
      );
      expect(out).toBe('X-Y');
    });

    it('treats undefined/null replacement values as empty string', () => {
      const tpl = '{x}/{y}/{z}';
      const out = TemplateUtil.replace(
        tpl,
        { token: '{x}', value: undefined as any, all: true },
        { token: '{y}', value: null as any, all: true },
        { token: '{z}', value: '', all: true },
      );
      expect(out).toBe('//');
    });

    it('leaves template unchanged when token is not present', () => {
      const tpl = 'abc';
      const out = TemplateUtil.replace(tpl, { token: '{x}', value: 'X', all: true });
      expect(out).toBe('abc');
    });

    it('applies replacements sequentially (order matters)', () => {
      const tpl = '{X}-{Y}';
      const out = TemplateUtil.replace(
        tpl,
        { token: '{X}', value: '{Y}', all: true }, // first turns {X} into {Y}
        { token: '{Y}', value: 'Z', all: true }    // then replaces all {Y}
      );
      expect(out).toBe('Z-Z');
    });

    it('handles tokens containing regex special characters when all=true (replaceAll path)', () => {
      const tpl = 'a.*b a.*b';
      const out = TemplateUtil.replace(tpl, { token: '.*', value: '-', all: true });
      expect(out).toBe('a-b a-b');
    });

    it('handles tokens containing regex special characters when replaceAll is unavailable (regex fallback)', () => {
      const original = (String.prototype as any).replaceAll;
      // Temporarily remove replaceAll to force regex fallback path
      try {
        (String.prototype as any).replaceAll = undefined;
        const tpl = 'price is $5 and $5 again';
        const out = TemplateUtil.replace(tpl, { token: '$5', value: '$10', all: true });
        expect(out).toBe('price is $10 and $10 again');
      } finally {
        (String.prototype as any).replaceAll = original;
      }
    });

    it('coerces non-string templates via String()', () => {
      const out = TemplateUtil.replace(123 as any, { token: '2', value: 'x', all: true });
      expect(out).toBe('1x3');
    });

    it('works with empty replacement list inside array', () => {
      const tpl = '{x}';
      const out = TemplateUtil.replace(tpl, []);
      expect(out).toBe('{x}');
    });

    it('supports single replacement object as the only argument after template', () => {
      const tpl = '{host}/x';
      const out = TemplateUtil.replace(tpl, { token: '{host}', value: 'H', all: true });
      expect(out).toBe('H/x');
    });
  });
});
