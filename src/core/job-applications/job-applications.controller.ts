import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, ParseIntPipe, Patch, Post, Put, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUserDto } from 'src/shared/dto/auth-user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { JobApplicationRequestDto, jobApplicationRequestSchema } from 'src/shared/dto/job-application-request.dto';
import { JobApplication } from 'generated/prisma';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

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
    this.logger.log('Criando candidatura');
    await this.jobApplicationsService.createJobApplication(user.id, jobApplicationDto);
  }

  @Get()
  async getUserJobApplications(
    @CurrentUser() user: AuthUserDto,
    @Query('page', new ParseIntPipe()) page: number = 1,
    @Query('pageSize', new ParseIntPipe()) pageSize: number = 5,
    @Query('orderBy') orderBy: keyof JobApplication = 'id'
  ) {
    // TODO: Talvez implementar um cache
    this.logger.log('Buscando candidaturas do usuário');
    return await this.jobApplicationsService.getUserJobApplications(user.id, page, pageSize, orderBy);
  }

  @Get(':id')
  async getJobApplicationById(
    @CurrentUser() user: AuthUserDto,
    @Param('id', new ParseIntPipe()) id: number
  ) {
    // TODO: Talvez implementar um cache
    this.logger.log(`Buscando candidatura do usuário pelo ID ${id}`);
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
    this.logger.log(`Atualizando dados da candidatura de ID ${id}`);
    await this.jobApplicationsService.updateJobApplication(user.id, id, updateJobApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteJobApplication(
    @CurrentUser() user: AuthUserDto,
    @Param('id', new ParseIntPipe()) id: number
  ) {
    // TODO: Talvez implementar um cache
    this.logger.log('Deletando candidatura do usuário');
    await this.jobApplicationsService.deleteJobApplication(user.id, id);
  }

  @Patch(':id/curriculum')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCurriculum(
    @CurrentUser() user: AuthUserDto,
    @Param('id', new ParseIntPipe()) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.logger.log(`Armazenando currículo para a candidatura de ID ${id}`);
    await this.jobApplicationsService.uploadCurriculum(user.id, id, file);
  }

  @Get(':id/curriculum')
  async getCurriculum(
    @CurrentUser() user: AuthUserDto,
    @Param('id', new ParseIntPipe()) id: number,
    @Res() response: Response
  ) {
    this.logger.log(`Recuperando arquivo de currículo para a candidatura de ID ${id}`);
    const file = await this.jobApplicationsService.getCurriculum(user.id, id);

    response.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=curriculum.pdf`
    })

    response.send(file);
  }
}
