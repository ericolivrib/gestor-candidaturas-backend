import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUserDto } from 'src/shared/dto/auth-user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { CreateJobApplicationDto, createJobApplicationSchema } from 'src/shared/dto/create-job-application.dto';

@Controller('v1/job-applications')
export class JobApplicationsController {
  private readonly logger: Logger = new Logger(JobApplicationsController.name);

  constructor(private readonly jobApplicationsService: JobApplicationsService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createJobApplication(
    @CurrentUser() user: AuthUserDto,
    @Body(new ZodValidationPipe(createJobApplicationSchema))
    jobApplicationDto: CreateJobApplicationDto
  ) {
    this.logger.log('Criando aplicação de vaga');
    await this.jobApplicationsService.createJobApplication(user.id, jobApplicationDto);
  }
}
