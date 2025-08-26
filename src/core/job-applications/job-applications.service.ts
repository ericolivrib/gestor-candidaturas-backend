import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobApplicationRequestDto } from 'src/shared/dto/job-application-request.dto';

@Injectable()
export class JobApplicationsService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }

  async createJobApplication(userId: string, createJobApplicationDto: JobApplicationRequestDto) {
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

  async getUserJobApplications(userId: string, page: number, pageSize: number) {
    if (page <= 0) {
      page = 1;
    }
    
    const skip = (page - 1) * pageSize;

    const jobApplications = await this.prismaService.jobApplication.findMany({
      where: { userId },
      skip,
      take: pageSize,
    })

    return jobApplications;
  }

  async getJobApplicationById(userId: string, id: number) {
    const jobApplication = await this.prismaService.jobApplication.findUniqueOrThrow({
      where: { id, userId }
    }).catch(() => {
      throw new NotFoundException(`Vaga não encontrada`);
    });

    return jobApplication;
  }

  async updateJobApplication(
    userId: string,
    id: number,
    updateJobApplicationDto: JobApplicationRequestDto
  ) {
    const { count } = await this.prismaService.jobApplication.updateMany({
      data: {
        jobTitle: updateJobApplicationDto.jobTitle,
        companyName: updateJobApplicationDto.companyName,
        url: updateJobApplicationDto.url,
        tags: updateJobApplicationDto.tags,
      },
      where: {
        id
      }
    });

    if (count == 0) {
      throw new NotFoundException('Candidatura não encontrada');
    }
  }

  async deleteJobApplication(userId: string, id: number) {
    const { count } = await this.prismaService.jobApplication.deleteMany({
      where: { userId, id }
    });

    if (count == 0) {
      throw new NotFoundException('Candidatura não encontrada');
    }
  }
}
