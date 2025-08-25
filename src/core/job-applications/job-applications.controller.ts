import { Controller } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';

@Controller('job-applications')
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}
}
