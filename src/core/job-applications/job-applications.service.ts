import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }

  async createJobApplication(userId: string, createJobApplicationDto: any) {
    await this.prismaService.jobApplication.create({
      data: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        jobTitle: <string>createJobApplicationDto['jobTitle'],
        status: 'DRAFT',
        userId
      }
    });
  }
}
