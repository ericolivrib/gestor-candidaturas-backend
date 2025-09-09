import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationExceptionFilter } from "./common/filters/validation-exception.filter";
import { Logger } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { ServerConfigProps } from "./common/config/server.config";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { CorsConfigProps } from "./common/config/cors.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  );
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);

  const corsOptions = configService.get<CorsConfigProps>("cors");

  app.enableCors({
    origin: corsOptions?.origin,
    methods: corsOptions?.methods,
    preflightContinue: corsOptions?.preflightContinue,
    optionsSuccessStatus: corsOptions?.optionsSuccessStatus,
    allowedHeaders: corsOptions?.allowedHeaders,
  });

  const server = configService.get<ServerConfigProps>("server");

  await app.listen(server!.port, server!.host);
}
void bootstrap();
