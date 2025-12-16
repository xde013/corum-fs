import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

describe('JwtRefreshAuthGuard', () => {
  let guard: JwtRefreshAuthGuard;

  beforeEach(() => {
    guard = new JwtRefreshAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should be an instance of AuthGuard', () => {
    expect(guard).toBeInstanceOf(JwtRefreshAuthGuard);
  });
});
