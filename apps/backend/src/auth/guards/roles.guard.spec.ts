import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../users/enums/role.enum';
import { User } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockUser: User;

    beforeEach(() => {
      mockUser = {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashedpassword',
        role: Role.ADMIN,
        birthdate: new Date('1990-01-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: mockUser,
          }),
        }),
      } as unknown as ExecutionContext;
    });

    it('should return true if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true if user has one of multiple required roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Role.USER, Role.ADMIN]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return false if user does not have required role', () => {
      mockUser.role = Role.USER;
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false if user is not in request', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const contextWithoutUser = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: undefined,
          }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(contextWithoutUser);

      expect(result).toBe(false);
    });

    it('should check roles from handler and class', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);

      guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockExecutionContext.getHandler(),
        mockExecutionContext.getClass(),
      ]);
    });
  });
});
