import { ConflictException, Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import * as bcrypt from 'bcryptjs';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/shared/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(newUser: CreateUserDto): Promise<void> {
    const existentUser = await this.findOneByEmail(newUser.email);

    if (existentUser != null) {
      throw new ConflictException(`E-mail ${newUser.email} já está em uso`);
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    await this.prismaService.user.create({
      data: {
        ...newUser,
        password: hashedPassword,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findOneById(userId: string): Promise<User | null> {
    return await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}
