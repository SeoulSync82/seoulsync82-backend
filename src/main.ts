import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common';
import { ERROR } from './auth/constants/error';

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
      // transformOptions: {
      //   enableImplicitConversion: true, // 타입 변환을 자동으로 수행
      // },
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

  // CORS 설정 추가!
  app.use(
    cors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );

  app.use(cookieParser());

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('SeoulSync82')
    .setDescription('The SeoulSync82 API description')
    .setVersion('1.0.0')
    .addTag('swagger')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3456);
}

bootstrap();
