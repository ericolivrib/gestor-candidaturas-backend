import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationExceptionFilter } from "./common/filters/validation-exception.filter";
import { Logger } from "nestjs-pino";
import { ConfigService } from "@nestjs/config";
import { ServerConfigProps } from "./common/config/server.config";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  );
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const server = configService.get<ServerConfigProps>("server");

  await app.listen(server!.port, server!.host);
}
void bootstrap();
