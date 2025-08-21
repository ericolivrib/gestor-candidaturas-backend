import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from 'src/common/config/jwt.config';

import { JwtPayloadDto } from 'src/shared/dto/jwt-payload.dto';
import { AuthUserDto } from 'src/shared/dto/auth-user.dto';
import { UsersService } from 'src/core/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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
    const userId = payload.sub;
    const user = await this.userService.findOneById(userId);

    if (user == null) {
      throw new UnauthorizedException('Acesso não autorizado');
    }

    return {
      id: userId,
      name: user.name,
      email: user.email,
    };
  }
}
