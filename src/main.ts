import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { config } from 'dotenv';
import { ValidationError } from 'class-validator';
import { BadRequestException } from '@nestjs/common/exceptions';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.FRONT_URL,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const newErrors = [];
        errors.forEach((error) => {
          Object.values(error.constraints).forEach((v) => {
            if (!!v) {
              newErrors.push(v);
            }
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
