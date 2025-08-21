import { registerAs } from '@nestjs/config';
import { Request } from 'express';
import { Params } from 'nestjs-pino';

import { CORRELATION_ID_HEADER } from 'src/common/middlewares/correlation-id.middleware';

export default registerAs(
  'logger',
  (): Params => ({
    pinoHttp: {
      transport: {
        target: 'pino-pretty',
        options: {
          messageKey: 'message',
        },
        level: process.env.LOG_LEVEL,
      },
      genReqId: (request: Request) =>
        <string>request.headers[CORRELATION_ID_HEADER],
      customProps: (request: Request) => {
        return {
          correlationId: request.headers[CORRELATION_ID_HEADER],
          userId: request.user?.id,
        };
      },
      autoLogging: false,
      serializers: {
        req: () => undefined,
        res: () => undefined,
      },
    },
  }),
);
