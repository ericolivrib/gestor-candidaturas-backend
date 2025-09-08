import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JobApplication, Status } from 'generated/prisma';
import { readFileSync, rmSync } from 'node:fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobApplicationRequestDto } from 'src/shared/dto/job-application-request.dto';
import { paginate } from 'src/shared/utils/pagination';

@Injectable()
export class JobApplicationsService {
  private readonly logger: Logger = new Logger(JobApplicationsService.name);

  constructor(
    private readonly prismaService: PrismaService
  ) { }

  async createJobApplication(userId: string, createJobApplicationDto: JobApplicationRequestDto) {
    this.logger.debug(`Iniciando criação de nova candidatura para o usuário ${userId}`);
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
    this.logger.debug(`Recuperando candidaturas do usuário ${userId}`);
    if (page <= 0) {
      this.logger.warn(`Número da página inválido ${page}. Usando valor padrão 1`);
      page = 1
    }

    const skip = (page - 1) * pageSize;

    const orderByFields = ['id', 'jobTitle', 'status', 'companyName', 'url']

    if (!orderByFields.includes(orderBy)) {
      this.logger.warn(`Campo de ordenação inválido. Usando valor padrão 'id'`);
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

    if (jobApplications.length === 0) {
      this.logger.debug(`Retornando lista vazia de candidaturas para o usuário ${userId}`);
      return paginate<JobApplication>([], page, pageSize);
    }

    this.logger.debug(`Retornando ${jobApplications.length} candidaturas do usuário ${userId}`);
    return paginate(jobApplications, page, pageSize);
  }

  async getJobApplicationById(userId: string, id: number) {
    this.logger.debug(`Recuperando candidatura ${id} do usuário ${userId}`);
    const jobApplication = await this.prismaService.jobApplication.findUnique({
      where: { id, userId }
    });

    if (jobApplication == null) {
      this.logger.log(`Candidatura ${id} não encontrada para o usuário ${userId}`);
      throw new NotFoundException(`Candidatura não encontrada`);
    }

    this.logger.debug(`Retornando candidatura ${id} do usuário ${userId}`);
    return jobApplication;
  }

  async updateJobApplication(
    userId: string,
    id: number,
    updateJobApplicationDto: JobApplicationRequestDto
  ) {
    this.logger.debug(`Iniciando atualização da candidatura ${id} do usuário ${userId}`);
    const { count } = await this.prismaService.jobApplication.updateMany({
      data: {
        jobTitle: updateJobApplicationDto.jobTitle,
        companyName: updateJobApplicationDto.companyName,
        url: updateJobApplicationDto.url,
        tags: updateJobApplicationDto.tags,
      },
      where: {
        userId, id
      }
    });

    if (count == 0) {
      this.logger.log(`Candidatura ${id} não encontrada para o usuário ${userId}`);
      throw new NotFoundException('Candidatura não encontrada');
    }
  }

  async deleteJobApplication(userId: string, id: number) {
    this.logger.debug(`Iniciando remoção da candidatura ${id} do usuário ${userId}`);
    const { count } = await this.prismaService.jobApplication.deleteMany({
      where: { userId, id }
    });

    if (count == 0) {
      this.logger.log(`Candidatura ${id} não encontrada para o usuário ${userId}`);
      throw new NotFoundException('Candidatura não encontrada');
    }
  }

  async uploadCurriculum(userId: string, id: number, file: Express.Multer.File) {
    this.logger.debug(`Iniciando upload de currículo para a candidatura ${id} do usuário ${userId}`);
    const jobApplication = await this.getJobApplicationById(userId, id);

    await this.prismaService.$transaction(async (db) => {
      if (jobApplication.curriculumPath != null) {
        this.logger.debug(`Removendo arquivo ${jobApplication.curriculumPath}`);

        try {
          this.logger.debug(`Removendo arquivo ${jobApplication.curriculumPath}`);
          rmSync(jobApplication.curriculumPath);
        } catch {
          this.logger.warn(`Arquivo ${jobApplication.curriculumPath} não encontrado para remoção`);
        }
      }

      this.logger.debug(`Atualizando caminho do currículo da candidatura ${id} com o caminho ${file.path}`);
      await db.jobApplication.update({
        data: { curriculumPath: file.path },
        where: { userId, id },
      });
    });
  }

  async getCurriculum(userId: string, id: number) {
    this.logger.debug(`Recuperando arquivo de currículo para a candidatura ${id} do usuário ${userId}`);
    const { curriculumPath } = await this.prismaService.jobApplication.findUniqueOrThrow({
      select: { curriculumPath: true },
      where: { userId, id }
    }).catch(() => {
      this.logger.log(`Candidatura ${id} não encontrada para o usuário ${userId}`);
      throw new NotFoundException('Candidatura não encontrada');
    });

    if (curriculumPath == null) {
      this.logger.log(`Candidatura ${id} não possui arquivo de currículo para o usuário ${userId}`);
      throw new ConflictException('Arquivo de currículo não encontrado para esta candidatura');
    }

    try {
      this.logger.debug(`Lendo arquivo de currículo em ${curriculumPath} para a candidatura ${id}`);
      const file = readFileSync(curriculumPath);
      return file;
    } catch {
      this.logger.error(`Falha ao recuperar o arquivo de currículo em ${curriculumPath} para a candidatura ${id}`);
      throw new InternalServerErrorException('Falha ao recuperar o arquivo de currículo para esta candidatura');
    }
  }

  async updateJobApplicationStatus(userId: string, id: number, status: Status) {
    this.logger.debug(`Atualizando status da candidatura ${id} para ${status} do usuário ${userId}`);
    const { count } = await this.prismaService.jobApplication.updateMany({
      data: { status },
      where: { userId, id }
    });

    if (count == 0) {
      this.logger.log(`Candidatura ${id} não encontrada para o usuário ${userId}`);
      throw new NotFoundException('Candidatura não encontrada');
    }
  }
}
