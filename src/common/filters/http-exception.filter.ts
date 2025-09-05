import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

const errorResponseTitle = (status: number): string => {
  const titleByStatus: Record<number, string> = {
    400: 'Requisição inválida',
    401: 'Não autorizado',
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    409: 'Conflito de estado',
    500: 'Erro interno do servidor',
  };

  return titleByStatus[status] || 'Erro';
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      title: errorResponseTitle(status),
      detail: exception.message,
      status,
      timestamp: new Date().toISOString(),
      instance: request.url,
    });
  }
}
