import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { LecturesModule } from './lectures/lectures.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ResourcesModule } from './resources/resources.module';
import { config } from 'dotenv';
config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.NODE_ENV === 'production'
        ? {
            url: process.env.DATABASE_URL,
            extra: { ssl: { rejectUnauthorized: true } },
          }
        : {
            url: process.env.DATABASE_URL,
          }),
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
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
