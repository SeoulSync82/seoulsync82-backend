import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { AppModule } from './app.module';
import { ERROR } from './commons/constants/error';
import { ConfigService } from './config/config.service';
import { SwaggerModels } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log', 'debug']
        : ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true, // DTO에 없는 속성을 제거
      // forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 들어오면 요청을 거부
      transformOptions: {
        enableImplicitConversion: true, // 타입 변환을 자동으로 수행
      },
      exceptionFactory: (error: ValidationError[] = []) => {
        return new BadRequestException(
          error.some((error) =>
            Object.keys(error.constraints).some((key) => key === 'isNotBadword'),
          )
            ? ERROR.SWEAR_WORD
            : error
                .map((error) => Object.keys(error.constraints).map((key) => error.constraints[key]))
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

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('SeoulSync82')
        .setDescription('The SeoulSync82 API description')
        .setVersion('1.0.0')
        .addTag('swagger')
        .addBearerAuth(
          { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
          'access-token',
        )
        .build(),
      {
        extraModels: SwaggerModels,
      },
    ),
    {
      swaggerOptions: {
        defaultModelsExpandDepth: -1,
        persistAuthorization: true, // 새로고침 해도 인증 토큰 유지
      },
    },
  );

  await app.listen(3456);
}

bootstrap();
