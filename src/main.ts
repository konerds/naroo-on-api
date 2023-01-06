import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { config } from 'dotenv';
import { ValidationError } from 'class-validator';
import { BadRequestException } from '@nestjs/common/exceptions';
import { winstonLogger } from './utils/winston.util';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONT_URL,
      credentials: true,
    },
    logger: winstonLogger,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors: ValidationError[]) => {
        console.error(errors);
        const newErrors = [];
        errors.forEach((error) => {
          Object.values(error.constraints).forEach((v) => {
            newErrors.push(v || '잘못된 요청입니다');
          });
        });
        return new BadRequestException(newErrors);
      },
    }),
  );

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  await app.listen(process.env.PORT);
}
bootstrap();
