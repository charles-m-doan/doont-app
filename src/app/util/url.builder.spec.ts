import { UrlBuilder } from './url.builder';

describe('UrlBuilder', () => {
  it('should create an instance', () => {
    expect(new UrlBuilder()).toBeTruthy();
  });

  describe('getShaFetchUrl', () => {
    const expected: string = '';
    beforeEach(() => {
    });
    it('should return full url', () => {
      // GIVEN
      // WHEN
      const actual: string = UrlBuilder.getShaFetchUrl();
      // THEN
      expect(actual).toEqual(expected);
    });
  });

});
