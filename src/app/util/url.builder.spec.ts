import { UrlBuilder } from './url.builder';

describe('UrlBuilder', () => {
  it('should create an instance', () => {
    expect(new UrlBuilder()).toBeTruthy();
  });

  describe('getShaFetchUrl', () => {
    beforeEach(() => {
    });
    it('should return full url', () => {
      // GIVEN
      const expected: string = 'https://api.github.com/repos/charles-m-doan/doont/commits/main';
      // WHEN
      const actual: string = UrlBuilder.getShaFetchUrl();
      // THEN
      expect(actual).toEqual(expected);
    });
  });

});
