import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof CurrentUser).toBe('function');
  });

  it('should be a parameter decorator', () => {
    // Parameter decorators in NestJS are functions that can be used as decorators
    // They accept target, propertyKey, and parameterIndex

    class TestClass {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      testMethod(@CurrentUser() user: any) {}
    }

    // Verify the decorator was applied (it doesn't throw)
    expect(TestClass).toBeDefined();
  });

  it('should accept optional data parameter', () => {
    class TestClass {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      testMethod(@CurrentUser('email') email: string) {}
    }

    expect(TestClass).toBeDefined();
  });
});
