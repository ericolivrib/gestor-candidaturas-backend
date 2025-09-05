import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';

import { UsersService } from 'src/core/users/users.service';
import { authUserSchema, AuthUserDto } from 'src/shared/dto/auth-user.dto';
import { JwtPayloadDto } from 'src/shared/dto/jwt-payload.dto';
import { JwtResponseDto } from 'src/shared/dto/jwt-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, pass: string): Promise<AuthUserDto> {
    this.logger.debug(`Validando usuário com e-mail ${email}`);
    const user = await this.usersService.findOneByEmail(email);

    if (user == null) {
      this.logger.log(`Usuário não encontrado com email ${email}`);
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    this.logger.debug(`Verificando senha para o usuário com email ${email}`);
    const isIncorrectPassword = !bcrypt.compareSync(pass, user.password);

    if (isIncorrectPassword) {
      this.logger.log(`Senha incorreta para o usuário com email ${email}`);
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }

    this.logger.debug(`Retornando usuário validado com email ${email}`);
    return authUserSchema.parse(user);
  }

  login(user: AuthUserDto): JwtResponseDto {
    this.logger.debug(`Preparando dados para login do usuário ${user.email}`);

    const now = new Date();
    const expirationTimeMs = now.getTime() + 1_800_000;
    
    this.logger.debug(`Gerando token JWT para o usuário ${user.email}`);
    const payload: JwtPayloadDto = {
      iss: 'Carrer Hub',
      sub: user.id,
      jti: randomUUID(),
    };

    this.logger.debug(`Retornando token JWT e seu tempo de expiração para o usuário ${user.email}`);
    return {
      token: this.jwtService.sign(payload, { expiresIn: '30m' }),
      expiresIn: expirationTimeMs,
    };
  }
}
