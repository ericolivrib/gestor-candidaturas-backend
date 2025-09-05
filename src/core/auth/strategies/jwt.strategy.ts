import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from 'src/common/config/jwt.config';

import { JwtPayloadDto } from 'src/shared/dto/jwt-payload.dto';
import { AuthUserDto, authUserSchema } from 'src/shared/dto/auth-user.dto';
import { UsersService } from 'src/core/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: <string>jwtConfiguration.secret,
    });
  }

  async validate(payload: JwtPayloadDto): Promise<AuthUserDto> {
    this.logger.debug(`Utilizando estratégia de validação JWT para o usuário ${payload.sub}`);
    const userId = payload.sub;
    const user = await this.userService.findOneById(userId);

    if (user == null) {
      this.logger.log(`Usuário com ${userId} não encontrado na base de dados`);
      throw new UnauthorizedException('Acesso não autorizado');
    }

    this.logger.debug(`Injetando usuário autenticado com ID ${user.id} na requisição`);
    return authUserSchema.parse(user);
  }
}
