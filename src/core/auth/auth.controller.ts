import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtResponseDto } from 'src/shared/dto/jwt-response.dto';
import { PublicRoute } from 'src/common/decorators/public-route.decorator';

@Controller('v1/auth')
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Req() request: Request): JwtResponseDto {
    this.logger.log(`Autenticando usuário ${request.user?.email}`);
    return this.authService.login(request.user!);
  }

  @HttpCode(HttpStatus.OK)
  @Get('user')
  getUser(@Req() req: Request) {
    this.logger.log(`Buscando dados do usuário autenticado ${req.user?.email}`);
    return req.user;
  }
}
