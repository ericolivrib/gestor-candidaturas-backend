import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUserDto } from 'src/shared/dto/auth-user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { JobApplicationRequestDto, jobApplicationRequestSchema } from 'src/shared/dto/job-application-request.dto';

@Controller('v1/job-applications')
export class JobApplicationsController {
  private readonly logger: Logger = new Logger(JobApplicationsController.name);

  constructor(private readonly jobApplicationsService: JobApplicationsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJobApplication(
    @CurrentUser() user: AuthUserDto,
    @Body(new ZodValidationPipe(jobApplicationRequestSchema))
    jobApplicationDto: JobApplicationRequestDto
  ) {
    this.logger.log('Criando aplicação de vaga');
    await this.jobApplicationsService.createJobApplication(user.id, jobApplicationDto);
  }

  @Get()
  async getUserJobApplications(
    @CurrentUser() user: AuthUserDto,
    @Query('page', new ParseIntPipe()) page: number = 1,
    @Query('pageSize', new ParseIntPipe()) pageSize: number = 5
  ) {
    // TODO: Talvez implementar um cache
    this.logger.log('Buscando vagas do usuário');
    return await this.jobApplicationsService.getUserJobApplications(user.id, page, pageSize);
  }

  @Get(':id')
  async getJobApplicationById(
    @CurrentUser() user: AuthUserDto,
    @Param('id', new ParseIntPipe()) id: number
  ) {
    // TODO: Talvez implementar um cache
    this.logger.log('Buscando vagas do usuário');
    return await this.jobApplicationsService.getJobApplicationById(user.id, id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateJobApplication(
    @CurrentUser() user: AuthUserDto,
    @Param('id', new ParseIntPipe()) id: number,
    @Body(new ZodValidationPipe(jobApplicationRequestSchema))
    updateJobApplicationDto: JobApplicationRequestDto
  ) {
    this.logger.log(`Atualizando dados da vaga de ID ${id}`);
    await this.jobApplicationsService.updateJobApplication(user.id, id, updateJobApplicationDto);
  }

  @Delete(':id')
  async deleteJobApplication(
    @CurrentUser() user: AuthUserDto,
    @Param('id', new ParseIntPipe()) id: number
  ) {
    // TODO: Talvez implementar um cache
    this.logger.log('Deletando candidatura do usuário');
    await this.jobApplicationsService.deleteJobApplication(user.id, id);
  }
}
