import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import z, { ZodError } from 'zod';

@Catch(ZodError)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: ZodError, host: ArgumentsHost) {
    this.logger.error('Falha na validação de dados de entrada');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.UNPROCESSABLE_ENTITY;

    const { fieldErrors } = z.flattenError(exception);

    response.status(status).send({
      title: 'Erro de validação',
      details: 'Má formatação dos dados de entrada',
      status,
      timestamp: new Date().toISOString(),
      instance: request.url,
      fieldErrors,
    });
  }
}
