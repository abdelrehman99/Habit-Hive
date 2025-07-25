import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './exception-filters/prisma.exception';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new PrismaExceptionFilter());

  const configService = new ConfigService();

  const port = configService.get('PORT') || 3000;

  const config = new DocumentBuilder()
    .addBearerAuth(undefined, 'default')
    .setTitle('Habit Hive')
    .setDescription('The Habit Hive API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      authAction: {
        default: {
          name: 'default',
          schema: {
            description: 'Default',
            type: 'http',
            in: 'header',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: configService.get('TOKEN'),
        },
      },
    },
  });

  await app.listen(port);
}
bootstrap();
