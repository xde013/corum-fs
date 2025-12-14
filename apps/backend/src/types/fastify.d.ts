import { User } from '../users/entities/user.entity';

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}
