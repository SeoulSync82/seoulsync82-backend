import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { blancLogger, BlancLoggerMiddleware } from 'blanc-logger';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { AppModule } from 'src/app.module';
import { ERROR } from 'src/commons/constants/error';
import { ConfigService } from 'src/config/config.service';
import { SwaggerModels } from 'src/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: blancLogger,
  });

  app.use(new BlancLoggerMiddleware().use);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (error: ValidationError[] = []) => {
        return new BadRequestException(
          error.some((e) => Object.keys(e.constraints).some((key) => key === 'isNotBadword'))
            ? ERROR.SWEAR_WORD
            : error
                .map((e) => Object.keys(e.constraints).map((key) => e.constraints[key]))
                .join('\n'),
        );
      },
    }),
  );

  const configService = app.get(ConfigService);
  app.use(
    cors({
      origin: [
        configService.get('SEOULSYNC82_FRONTEND_LOCAL'),
        configService.get('SEOULSYNC82_FRONTEND_LOCAL_SUB'),
        configService.get('SEOULSYNC82_FRONTEND_STAGING'),
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );
  app.use(cookieParser());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SeoulSync82')
    .setDescription('The SeoulSync82 API description')
    .setVersion('0.3.0')
    .addTag('swagger')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: SwaggerModels,
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1, // 새로고침해도 인증 토큰 유지
      persistAuthorization: true,
    },
  });

  await app.listen(3456);
}

bootstrap();
