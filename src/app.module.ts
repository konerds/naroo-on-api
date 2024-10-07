import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LecturesModule } from './lectures/lectures.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ResourcesModule } from './resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        ...(configService.get('NODE_ENV') === 'production'
          ? {
              url: configService.get<string>('DATABASE_URL'),
              extra: { ssl: { rejectUnauthorized: false } },
            }
          : {
              url: configService.get<string>('DATABASE_URL_DEV'),
              extra: { ssl: { rejectUnauthorized: false } },
            }),
        autoLoadEntities: true,
        synchronize:
          configService.get<string>('IS_SYNC') === 'Y' ? true : false,
        logging: true,
      }),
    }),
    UsersModule,
    LecturesModule,
    ResourcesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
