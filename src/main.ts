import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    {
      forceCloseConnections: false,
      logger:
        process.env.NODE_ENV === 'production'
          ? ['error', 'warn', 'log', 'debug']
          : ['error', 'warn', 'log', 'verbose', 'debug'],
    },
  );
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
