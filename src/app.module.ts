import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { LoggerModule } from "nestjs-pino";
import { CorrelationIdMiddleware } from "./common/middlewares/correlation-id.middleware";
import { ConfigModule } from "@nestjs/config";
import { CoreModule } from "./core/core.module";
import serverConfig from "./common/config/server.config";
import loggerConfig from "./common/config/logger.config";
import { MulterModule } from "@nestjs/platform-express";
import multerConfig from "./common/config/multer.config";
import corsConfig from "./common/config/cors.config";

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      load: [serverConfig, multerConfig, corsConfig],
      isGlobal: true,
    }),
    LoggerModule.forRootAsync(loggerConfig.asProvider()),
    MulterModule.registerAsync(multerConfig.asProvider()),
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
