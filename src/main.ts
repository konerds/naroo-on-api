import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationError } from 'class-validator';
import { BadRequestException } from '@nestjs/common/exceptions';
import { winstonLogger } from './utils/winston.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const listWhitelistCors = configService.get<string>('FRONT_URL').split(',');
  app.enableCors({
    origin: listWhitelistCors,
    credentials: true,
  });
  app.useLogger(
    winstonLogger(configService.get<string>('IS_SAVE_LOGFILE') === 'Y'),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors: ValidationError[]) => {
        console.error(errors);
        const newErrors = [];
        errors.forEach((e) => {
          Object.values(e.constraints).forEach((v) => {
            newErrors.push(v || '잘못된 요청입니다');
          });
        });
        return new BadRequestException(newErrors);
      },
    }),
  );
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
  const portApp = configService.get('PORT');
  await app.listen(portApp);
}

bootstrap();
