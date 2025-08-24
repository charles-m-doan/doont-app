import { TemplateUtil } from './template.util';
import type { Replacement } from './template.util';

describe('TemplateUtil', () => {
  it('should create an instance', () => {
    // GIVEN
    const instance: TemplateUtil = new TemplateUtil();
    // WHEN
    const actual: boolean = !!instance;
    // THEN
    const expected: boolean = true;
    expect(actual).toEqual(expected);
  });

  describe('replace', () => {
    it('returns original string when no replacements are provided', () => {
      // GIVEN
      const template: string = '{host}/x';
      // WHEN
      const actual: string = TemplateUtil.replace(template);
      // THEN
      const expected: string = '{host}/x';
      expect(actual).toEqual(expected);
    });

    it('returns empty string for null template', () => {
      // GIVEN
      const template: null = null;
      // WHEN
      const actual: string = TemplateUtil.replace(template as unknown as string);
      // THEN
      const expected: string = '';
      expect(actual).toEqual(expected);
    });

    it('returns empty string for undefined template', () => {
      // GIVEN
      const template: undefined = undefined;
      // WHEN
      const actual: string = TemplateUtil.replace(template as unknown as string);
      // THEN
      const expected: string = '';
      expect(actual).toEqual(expected);
    });

    it('handles empty template with no replacements', () => {
      // GIVEN
      const template: string = '';
      // WHEN
      const actual: string = TemplateUtil.replace(template);
      // THEN
      const expected: string = '';
      expect(actual).toEqual(expected);
    });

    it('handles empty template with replacements supplied', () => {
      // GIVEN
      const template: string = '';
      const rep: Replacement = { token: '{x}', value: 'y', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(template, rep);
      // THEN
      const expected: string = '';
      expect(actual).toEqual(expected);
    });

    it('does a single replacement when all=false', () => {
      // GIVEN
      const template: string = '{repo}/{repo}/{repo}';
      const rep: Replacement = { token: '{repo}', value: 'r', all: false };
      // WHEN
      const actual: string = TemplateUtil.replace(template, rep);
      // THEN
      const expected: string = 'r/{repo}/{repo}';
      expect(actual).toEqual(expected);
    });

    it('replaces all occurrences when all=true', () => {
      // GIVEN
      const template: string = '{repo}/{repo}/{repo}';
      const rep: Replacement = { token: '{repo}', value: 'r', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(template, rep);
      // THEN
      const expected: string = 'r/r/r';
      expect(actual).toEqual(expected);
    });

    it('handles multiple replacements as varargs', () => {
      // GIVEN
      const template: string = '{host}/repos/{owner}/{repo}/commits/{branch}';
      const repHost: Replacement = { token: '{host}', value: 'https://api.github.com', all: true };
      const repOwner: Replacement = { token: '{owner}', value: 'octocat', all: true };
      const repRepo: Replacement = { token: '{repo}', value: 'hello-world', all: true };
      const repBranch: Replacement = { token: '{branch}', value: 'main', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(template, repHost, repOwner, repRepo, repBranch);
      // THEN
      const expected: string = 'https://api.github.com/repos/octocat/hello-world/commits/main';
      expect(actual).toEqual(expected);
    });

    it('accepts an array of replacements', () => {
      // GIVEN
      const template: string = '{a}-{b}-{c}';
      const reps: Replacement[] = [
        { token: '{a}', value: 'A', all: true },
        { token: '{b}', value: 'B', all: true },
        { token: '{c}', value: 'C', all: true },
      ];
      // WHEN
      const actual: string = TemplateUtil.replace(template, reps);
      // THEN
      const expected: string = 'A-B-C';
      expect(actual).toEqual(expected);
    });

    it('accepts mixed varargs and arrays (flattens one level)', () => {
      // GIVEN
      const template: string = '{a}-{b}-{c}-{b}';
      const repA: Replacement = { token: '{a}', value: 'A', all: true };
      const arr: Replacement[] = [
        { token: '{b}', value: 'B', all: true },
        { token: '{c}', value: 'C', all: true },
      ];
      // WHEN
      const actual: string = TemplateUtil.replace(template, repA, arr);
      // THEN
      const expected: string = 'A-B-C-B';
      expect(actual).toEqual(expected);
    });

    it('ignores null/undefined replacement entries and empty tokens', () => {
      // GIVEN
      const template: string = '{x}-{y}';
      const rNull: null = null;
      const rUndef: undefined = undefined;
      const rEmptyToken: Replacement = { token: '', value: 'NO', all: true };
      const rX: Replacement = { token: '{x}', value: 'X', all: true };
      const rY: Replacement = { token: '{y}', value: 'Y', all: true };
      const arrMixed: Replacement[] = [undefined as unknown as Replacement, rY];
      // WHEN
      const actual: string = TemplateUtil.replace(template, rNull as unknown as Replacement, rUndef as unknown as Replacement, rEmptyToken, rX, arrMixed);
      // THEN
      const expected: string = 'X-Y';
      expect(actual).toEqual(expected);
    });

    it('treats undefined/null replacement values as empty string', () => {
      // GIVEN
      const template: string = '{x}/{y}/{z}';
      const rX: Replacement = { token: '{x}', value: undefined as unknown as string, all: true };
      const rY: Replacement = { token: '{y}', value: null as unknown as string, all: true };
      const rZ: Replacement = { token: '{z}', value: '', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(template, rX, rY, rZ);
      // THEN
      const expected: string = '//';
      expect(actual).toEqual(expected);
    });

    it('leaves template unchanged when token is not present', () => {
      // GIVEN
      const template: string = 'abc';
      const rX: Replacement = { token: '{x}', value: 'X', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(template, rX);
      // THEN
      const expected: string = 'abc';
      expect(actual).toEqual(expected);
    });

    it('applies replacements sequentially (order matters)', () => {
      // GIVEN
      const template: string = '{X}-{Y}';
      const r1: Replacement = { token: '{X}', value: '{Y}', all: true };
      const r2: Replacement = { token: '{Y}', value: 'Z', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(template, r1, r2);
      // THEN
      const expected: string = 'Z-Z';
      expect(actual).toEqual(expected);
    });

    it('handles tokens containing regex special characters when all=true (replaceAll path)', () => {
      // GIVEN
      const template: string = 'a.*b a.*b';
      const rep: Replacement = { token: '.*', value: '-', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(template, rep);
      // THEN
      const expected: string = 'a-b a-b';
      expect(actual).toEqual(expected);
    });

    it('handles tokens containing regex special characters when replaceAll is unavailable (regex fallback)', () => {
      // GIVEN
      const originalReplaceAll: any = (String.prototype as any).replaceAll;
      (String.prototype as any).replaceAll = undefined as unknown as typeof String.prototype.replaceAll;
      const template: string = 'price is $5 and $5 again';
      const rep: Replacement = { token: '$5', value: '$10', all: true };
      // WHEN
      let actual: string;
      try {
        actual = TemplateUtil.replace(template, rep);
      } finally {
        (String.prototype as any).replaceAll = originalReplaceAll;
      }
      // THEN
      const expected: string = 'price is $10 and $10 again';
      expect(actual!).toEqual(expected);
    });

    it('coerces non-string templates via String()', () => {
      // GIVEN
      const nonStringTemplate: any = 123;
      const rep: Replacement = { token: '2', value: 'x', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(nonStringTemplate as unknown as string, rep);
      // THEN
      const expected: string = '1x3';
      expect(actual).toEqual(expected);
    });

    it('works with empty replacement list inside array', () => {
      // GIVEN
      const template: string = '{x}';
      const emptyReps: Replacement[] = [];
      // WHEN
      const actual: string = TemplateUtil.replace(template, emptyReps);
      // THEN
      const expected: string = '{x}';
      expect(actual).toEqual(expected);
    });

    it('supports single replacement object as the only argument after template', () => {
      // GIVEN
      const template: string = '{host}/x';
      const rep: Replacement = { token: '{host}', value: 'H', all: true };
      // WHEN
      const actual: string = TemplateUtil.replace(template, rep);
      // THEN
      const expected: string = 'H/x';
      expect(actual).toEqual(expected);
    });
  });
});
