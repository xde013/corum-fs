import { Public, IS_PUBLIC_KEY } from './public.decorator';

describe('Public Decorator', () => {
  it('should be defined', () => {
    expect(Public).toBeDefined();
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should return a function', () => {
    expect(typeof Public).toBe('function');
  });

  it('should return SetMetadata function when called', () => {
    const decorator = Public();
    expect(typeof decorator).toBe('function');
  });

  it('should be usable as a decorator', () => {
    // Verify decorator can be applied without errors
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestClass {
        @Public()
        testMethod() {}
      }
    }).not.toThrow();
  });
});
