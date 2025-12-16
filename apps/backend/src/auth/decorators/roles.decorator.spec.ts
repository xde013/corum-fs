import { Roles, ROLES_KEY } from './roles.decorator';
import { Role } from '../../users/enums/role.enum';

describe('Roles Decorator', () => {
  it('should be defined', () => {
    expect(Roles).toBeDefined();
    expect(ROLES_KEY).toBe('roles');
  });

  it('should return a function', () => {
    expect(typeof Roles).toBe('function');
  });

  it('should accept single role', () => {
    const decorator = Roles(Role.ADMIN);
    expect(typeof decorator).toBe('function');
  });

  it('should accept multiple roles', () => {
    const decorator = Roles(Role.ADMIN, Role.USER);
    expect(typeof decorator).toBe('function');
  });

  it('should be usable as a decorator with single role', () => {
    expect(() => {
      class TestClass {
        @Roles(Role.ADMIN)
        testMethod() {}
      }
    }).not.toThrow();
  });

  it('should be usable as a decorator with multiple roles', () => {
    expect(() => {
      class TestClass {
        @Roles(Role.ADMIN, Role.USER)
        testMethod() {}
      }
    }).not.toThrow();
  });
});

