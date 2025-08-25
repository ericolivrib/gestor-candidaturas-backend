import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AuthUserDto } from 'src/shared/dto/auth-user.dto';

@Controller('v1/job-applications')
export class JobApplicationsController {
  private readonly logger: Logger = new Logger(JobApplicationsController.name);

  constructor(private readonly jobApplicationsService: JobApplicationsService) { }

  @Post()
  @HttpCode(HttpStatus.OK)
  async createJobApplication(@CurrentUser() user: AuthUserDto, @Body() jobApplicationDto: object) {
    this.logger.log('Criando aplicação de vaga');
    await this.jobApplicationsService.createJobApplication(user.id, jobApplicationDto);
  }
}
