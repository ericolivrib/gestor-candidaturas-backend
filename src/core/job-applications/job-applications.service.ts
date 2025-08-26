import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobApplicationDto } from 'src/shared/dto/create-job-application.dto';

@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }

  async createJobApplication(userId: string, createJobApplicationDto: CreateJobApplicationDto) {
    await this.prismaService.jobApplication.create({
      data: {
        jobTitle: createJobApplicationDto.jobTitle,
        companyName: createJobApplicationDto.companyName,
        url: createJobApplicationDto.url,
        tags: createJobApplicationDto.tags,
        status: 'DRAFT',
        userId
      }
    });
  }

  async getUserJobApplications(userId: string) {
    const jobApplications = await this.prismaService.jobApplication.findMany({
      where: { userId }
    })

    return jobApplications;
  }

  async getJobApplicationById(id: number) {
    const jobApplication = await this.prismaService.jobApplication.findUniqueOrThrow({
      where: { id }
    }).catch(() => {
      throw new NotFoundException(`Vaga não encontrada com o ID ${id}`);
    });

    return jobApplication;
  }
}
