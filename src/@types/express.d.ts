import { AuthUserDto } from 'src/shared/dto/auth-user.dto';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUserDto {}
  }
}

export {};
