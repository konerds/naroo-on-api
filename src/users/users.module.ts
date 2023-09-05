import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from '../users/strategy/jwt.strategy';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { config } from 'dotenv';
import { User } from './entity/user.entity';
import { MailgunModule } from 'nestjs-mailgun';
config();

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: 7200,
        },
      }),
    }),
    MailgunModule.forAsyncRoot({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        username: 'api',
        key: configService.get<string>('MAILGUN_KEY'),
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService, JwtStrategy],
  controllers: [UsersController],
  exports: [JwtStrategy, PassportModule],
})
export class UsersModule {}
