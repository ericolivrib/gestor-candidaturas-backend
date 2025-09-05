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
    this.logger.debug(`Utilizando estratégia de validação local para o usuário com email ${email}`);

    const user = await this.authService.validateUser(email, password);

    this.logger.debug(`Injetando usuário autenticado com email ${email} na requisição`);
    return user;
  }
}
