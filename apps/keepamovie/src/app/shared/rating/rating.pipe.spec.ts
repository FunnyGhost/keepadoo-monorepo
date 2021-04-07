import { RatingPipe } from './rating.pipe';

describe('RatingPipe', () => {
  test('create an instance', () => {
    const pipe = new RatingPipe();

    expect(pipe).toBeTruthy();
  });

  test('should return the formatted rating', () => {
    const result = new RatingPipe().transform(4.5);

    expect(result).toEqual('⭐ 4.5');
  });
});
