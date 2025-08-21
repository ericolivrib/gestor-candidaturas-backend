import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';

import { UsersService } from 'src/core/users/users.service';
import { authUserSchema, AuthUserDto } from 'src/shared/dto/auth-user.dto';
import { JwtPayloadDto } from 'src/shared/dto/jwt-payload.dto';
import { JwtResponseDto } from 'src/shared/dto/jwt-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUserDto> {
    const user = await this.usersService.findOneByEmail(email);

    if (user == null) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    const isIncorrectPassword = !bcrypt.compareSync(pass, user.password);

    if (isIncorrectPassword) {
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    return authUserSchema.parse(user);
  }

  login(user: AuthUserDto): JwtResponseDto {
    const now = new Date();
    const expirationTimeMs = now.getTime() + 1_800_000;

    const payload: JwtPayloadDto = {
      iss: 'Carrer Hub',
      sub: user.id,
      jti: randomUUID(),
    };

    return {
      token: this.jwtService.sign(payload, { expiresIn: '30m' }),
      expiresIn: expirationTimeMs,
    };
  }
}
