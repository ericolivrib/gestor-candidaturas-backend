import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JobApplication } from 'generated/prisma';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CURRICULUM_DIR } from 'src/shared/constants/static.constants';
import { JobApplicationRequestDto } from 'src/shared/dto/job-application-request.dto';

@Injectable()
export class JobApplicationsService {
  private readonly logger: Logger = new Logger(JobApplicationsService.name);

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

  async getUserJobApplications(userId: string, page: number, pageSize: number, orderBy: keyof JobApplication) {
    if (page <= 0) page = 1;
    const skip = (page - 1) * pageSize;

    const orderByFields = ['id', 'jobTitle', 'status', 'companyName', 'url']

    if (!orderByFields.includes(orderBy)) {
      orderBy = 'id';
    }

    const jobApplications = await this.prismaService.jobApplication.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: {
        [orderBy]: 'desc',
      }
    })

    return jobApplications;
  }

  async getJobApplicationById(userId: string, id: number) {
    const jobApplication = await this.prismaService.jobApplication.findUniqueOrThrow({
      where: { id, userId }
    }).catch(() => {
      throw new NotFoundException(`Candidatura não encontrada`);
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

  async uploadCurriculum(userId: string, id: number, file: Express.Multer.File) {
    const jobApplication = await this.getJobApplicationById(userId, id);

    if (!existsSync(CURRICULUM_DIR)) {
      mkdirSync(CURRICULUM_DIR);
    }

    const curriculumPath = `${CURRICULUM_DIR}/Curriculum${Date.now()}@${userId}.pdf`;

    await this.prismaService.$transaction(async (db) => {
      await db.jobApplication.update({
        data: { curriculumPath },
        where: { userId, id },
      })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      writeFileSync(curriculumPath, file.buffer, {});

      if (jobApplication.curriculumPath != null) {
        this.logger.warn('Removendo arquivo de currículo existente do disco');

        try {
          rmSync(jobApplication.curriculumPath);
        } catch {
          this.logger.warn('Arquivo de currículo não encontrado');
        }
      }
    });
  }

  async getCurriculum(userId: string, id: number) {
    const { curriculumPath } = await this.prismaService.jobApplication.findUniqueOrThrow({
      select: { curriculumPath: true },
      where: { userId, id }
    }).catch(() => {
      throw new NotFoundException('Candidatura não encontrada');
    });

    if (curriculumPath == null) {
      throw new ConflictException('Arquivo de currículo não encontrado para esta candidatura');
    }

    try {
      const file = readFileSync(curriculumPath);
      return file;
    } catch {
      throw new InternalServerErrorException('Falha ao recuperar o arquivo de currículo para esta candidatura');
    }
  }
}
