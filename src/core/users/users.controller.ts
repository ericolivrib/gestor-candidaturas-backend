import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PublicRoute } from 'src/common/decorators/public-route.decorator';
import {
  CreateUserDto,
  createUserSchema,
} from 'src/shared/dto/create-user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';

@Controller('v1/users')
export class UsersController {
  private readonly logger: Logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @PublicRoute()
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(
    @Body(new ZodValidationPipe(createUserSchema))
    newUser: CreateUserDto,
  ): Promise<void> {
    this.logger.log('Criando novo usuário');
    await this.usersService.createUser(newUser);
  }
}
