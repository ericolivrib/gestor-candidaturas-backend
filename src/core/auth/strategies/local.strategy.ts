import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthUserDto } from 'src/shared/dto/auth-user.dto';
import { AuthService } from '../auth.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<AuthUserDto> {
    this.logger.log(`Tentativa de login com email ${email}`);

    const user = await this.authService.validateUser(email, password);
    return user;
  }
}
