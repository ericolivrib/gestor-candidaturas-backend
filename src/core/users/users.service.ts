import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { User } from 'generated/prisma';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/shared/dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createUser(newUser: CreateUserDto): Promise<void> {
    this.logger.debug(`Iniciando criação de novo usuário com email ${newUser.email}`);
    const existentUser = await this.findOneByEmail(newUser.email);

    if (existentUser != null) {
      this.logger.log(`E-mail ${newUser.email} já está em uso`);
      throw new ConflictException(`E-mail ${newUser.email} já está em uso`);
    }

    this.logger.debug(`Criptografando a senha do usuário com email ${newUser.email}`);
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    this.logger.debug(`Salvando novo usuário com email ${newUser.email} na base de dados`);
    await this.prismaService.user.create({
      data: {
        ...newUser,
        password: hashedPassword,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Buscando usuário com email ${email}`);
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOneById(userId: string): Promise<User | null> {
    this.logger.debug(`Buscando usuário com ID ${userId}`);
    return await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
