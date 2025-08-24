import { UrlBuilder } from './url.builder';

describe('UrlBuilder', () => {
  it('should create an instance', () => {
    expect(new UrlBuilder()).toBeTruthy();
  });

  describe('getLatestShaUrl', () => {
    it('should return full url for latest commit sha of main', () => {
      // GIVEN
      // WHEN
      const actual: string = UrlBuilder.getLatestShaUrl();
      // THEN
      const expected: string = 'https://api.github.com/repos/charles-m-doan/doont/commits/main';
      expect(actual).toEqual(expected);
    });
  });

  describe('getFileListUrl', () => {
    it('should return full url for list of all files in repo on main at top level', () => {
      // GIVEN
      // WHEN
      const actual: string = UrlBuilder.getFileListUrl();
      // THEN
      const expected: string = 'https://api.github.com/repos/charles-m-doan/doont/git/trees/main?recursive=1';
      expect(actual).toEqual(expected);
    });
  });

  describe('getFileContentsUrl', () => {
    it('should return full url for fetching the contents of a specific file via GET call', () => {
      // GIVEN
      const sha: string = 'b1d964a784d49498e686a71ba1fa2f2604f47431';
      const file: string = 'test.txt';
      // WHEN
      const actual: string = UrlBuilder.getFileContentsUrl(sha, file);
      // THEN
      const expected: string = 'https://raw.githubusercontent.com/charles-m-doan/doont/b1d964a784d49498e686a71ba1fa2f2604f47431/test.txt';
      expect(actual).toEqual(expected);
    });
  });

});
