import {
  OnModuleInit,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CONST_ROLE_TYPE, ROLE_TYPE, User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as UUID } from 'uuid';
import { InitPasswordDto } from './dto/init-password.dto';
import { Repository, DataSource } from 'typeorm';
import { MailgunService } from 'nestjs-mailgun';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async createAdminUser() {
    try {
      const existAdminUser = await this.usersRepository.exist({
        where: { role: CONST_ROLE_TYPE.ADMIN },
      });
      if (!existAdminUser) {
        const emailAdminFirst =
          this.configService.get<string>('EMAIL_FIRST_ADMIN') ||
          'admin@test.com';
        const passwordHashedAdminFirst = await bcrypt.hash(
          this.configService.get<string>('PASSWORD_FIRST_ADMIN') ||
            'admin@test.com',
          10,
        );
        await this.usersRepository.save({
          role: CONST_ROLE_TYPE.ADMIN,
          email: emailAdminFirst,
          nickname: '관리자',
          password: passwordHashedAdminFirst,
          phone: '010-0000-0000',
          isAgreeEmail: true,
          isAuthorized: true,
          verifyToken: null,
        });
      }
    } catch (e) {
      throw e;
    }
  }

  async onModuleInit() {
    if (this.configService.get<string>('IS_CREATE_ADMIN') === 'Y') {
      await this.createAdminUser();
    }
  }

  async signUp(signUpDto: SignUpDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const passwordHashed = await bcrypt.hash(signUpDto.password, 10);
      if (!!!signUpDto.phone.match(/^[0-9]{3}[-]+[0-9]{4}[-]+[0-9]{4}$/)) {
        throw new HttpException(
          '휴대폰 번호를 정확하게 입력해주세요',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const isUniquePhone = await queryRunner.manager.exists(User, {
        where: { phone: signUpDto.phone },
      });
      if (isUniquePhone) {
        throw new HttpException(
          '등록된 휴대폰 번호가 존재합니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const isUniqueEmail = await queryRunner.manager.exists(User, {
        where: { email: signUpDto.email },
      });
      if (isUniqueEmail) {
        throw new HttpException(
          '등록된 이메일 주소가 존재합니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const verifyToken = UUID();
      const userCreated = new User();
      userCreated.email = signUpDto.email;
      userCreated.nickname = signUpDto.nickname;
      userCreated.password = passwordHashed;
      userCreated.phone = signUpDto.phone;
      userCreated.isAgreeEmail = signUpDto.isAgreeEmail === 'true';
      userCreated.isAuthorized = false;
      userCreated.verifyToken = verifyToken;
      await queryRunner.manager.save(userCreated);
      await this.sendVerifyEmail(userCreated);
      await queryRunner.commitTransaction();
      return { message: '발송된 메일을 통해 이메일 인증을 완료해주세요' };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.usersRepository.findOne({
        select: ['id', 'email', 'password', 'isAuthorized'],
        where: {
          email: signInDto.email,
        },
      });
      if (!!!user) {
        throw new HttpException(
          '존재하지 않는 계정입니다',
          HttpStatus.NOT_FOUND,
        );
      }
      if (!user.isAuthorized) {
        await this.sendVerifyEmail(user);
        throw new HttpException(
          '재전송된 인증 메일을 통해 이메일 인증을 완료해주세요',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const passwordConfirm = await bcrypt.compare(
        signInDto.password,
        user.password,
      );
      if (!passwordConfirm) {
        throw new HttpException(
          '비밀번호가 일치하지 않습니다',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const token = this.jwtService.sign({ id: user.id });
      return { token };
    } catch (e) {
      throw e;
    }
  }

  async sendVerifyEmail(user: User) {
    try {
      const domain = this.configService.get<string>('MAILGUN_DOMAIN');
      const listWhitelistCors = this.configService
        .get<string>('FRONT_URL')
        .split(',');
      const urlPrimaryDomainFrontend = !!listWhitelistCors
        ? listWhitelistCors[0]
        : undefined;
      if (!!!urlPrimaryDomainFrontend) {
        throw new Error('urlPrimaryDomainFrontend is not defined');
      }
      await this.mailgunService.createEmail(domain, {
        to: user.email,
        from: this.configService.get<string>('MAILGUN_USER') + '@' + domain,
        subject:
          '나루온 회원이 되신 것을 축하합니다, 제공된 링크를 통해 이메일 인증 요청을 완료해주세요',
        html: `<a style="background-color:black;color:white;border-radius:20px;padding:15px;display:block;margin:auto;width:300px" href="${urlPrimaryDomainFrontend}/verify/${user.verifyToken}">이메일 인증하기</a>`,
      });
    } catch (e) {
      console.error(e);
      throw new HttpException(
        '인증 메일을 전송하는 데 오류가 발생하였습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyCode(param: { requestToken: string }) {
    try {
      const userVerifying = await this.usersRepository.findOne({
        where: {
          verifyToken: param.requestToken,
        },
      });
      if (!!!userVerifying)
        throw new HttpException(
          '잘못된 인증 요청입니다',
          HttpStatus.UNAUTHORIZED,
        );
      userVerifying.verifyToken = null;
      userVerifying.isAuthorized = true;
      const result = await this.usersRepository.save(userVerifying);
      const token = this.jwtService.sign({ id: result.id });
      return { token };
    } catch (e) {
      throw e;
    }
  }

  async sendInitPassword(initPasswordDto: InitPasswordDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userInitiating = await queryRunner.manager.findOne(User, {
        where: {
          email: initPasswordDto.email,
          nickname: initPasswordDto.nickname,
          phone: initPasswordDto.phone,
        },
      });
      if (!!!userInitiating)
        throw new HttpException(
          '존재하지 않는 계정입니다',
          HttpStatus.NOT_FOUND,
        );
      const passwordGeneratedRandomly = UUID().substr(0, 16);
      const passwordHashedGeneratedRandomly = await bcrypt.hash(
        passwordGeneratedRandomly,
        10,
      );
      userInitiating.password = passwordHashedGeneratedRandomly;
      const domain = this.configService.get<string>('MAILGUN_DOMAIN');
      await this.mailgunService.createEmail(domain, {
        to: userInitiating.email,
        from: this.configService.get<string>('MAILGUN_USER') + '@' + domain,
        subject: '나루온 비밀번호 재설정 메일',
        html: `<div><p style="font-size:1rem;">${userInitiating.nickname} / ${userInitiating.email} 계정의 임시 비밀번호는 <span style="color:blue;">${passwordGeneratedRandomly}</span> 입니다</p><p style="margin-top:5px;color:red;font-size:0.7rem">보안을 위해 반드시 로그인하신 후 비밀번호를 재설정해주세요!</p></div>`,
      });
      await queryRunner.manager.save(userInitiating);
      return {
        message: '보안을 위해 반드시 로그인하신 후 비밀번호를 재설정해주세요',
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  getMe(user: User) {
    return !!user
      ? {
          userId: user.id,
          role: user.role,
          nickname: user.nickname,
        }
      : { userId: null, role: null, nickname: null };
  }

  async getMyInfo(user: User) {
    try {
      const infoUser = await this.usersRepository.findOne({
        where: { id: +user.id },
        select: ['id', 'email', 'nickname', 'phone'],
      });
      if (!!!infoUser) {
        throw new HttpException(
          '존재하지 않는 계정입니다',
          HttpStatus.NOT_FOUND,
        );
      }
      return infoUser;
    } catch (e) {
      throw e;
    }
  }

  async findAllUsers() {
    try {
      const usersAll = await this.usersRepository.find({
        select: ['id', 'email', 'nickname', 'phone', 'role'],
      });
      if (!(!!usersAll && usersAll.length > 0)) {
        return null;
      }
      return usersAll;
    } catch (e) {
      throw e;
    }
  }

  async updateUserInfo(
    user: User,
    updateUserInfoDto: {
      email: string | null;
      nickname: string | null;
      password: string | null;
      phone: string | null;
      role: ROLE_TYPE | null;
      introduce: string | null;
    },
  ) {
    try {
      const userUpdating = await this.usersRepository.findOne({
        where: {
          id: user.id,
        },
      });
      if (!!!userUpdating) {
        throw new HttpException('잘못된 요청입니다', HttpStatus.BAD_REQUEST);
      }
      userUpdating.nickname =
        updateUserInfoDto.nickname || userUpdating.nickname;
      userUpdating.password = updateUserInfoDto.password
        ? await bcrypt.hash(updateUserInfoDto.password, 10)
        : userUpdating.password;
      userUpdating.phone = updateUserInfoDto.phone || userUpdating.phone;
      userUpdating.role = updateUserInfoDto.role || userUpdating.role;
      await this.usersRepository.save(userUpdating);
      return { message: '성공적으로 회원 정보가 업데이트되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async updateUserInfoForAdmin(
    param: { userId: string },
    updateUserInfoDto: {
      email: string | null;
      nickname: string | null;
      password: string | null;
      phone: string | null;
      role: ROLE_TYPE | null;
      introduce: string | null;
    },
  ) {
    try {
      const userUpdating = await this.usersRepository.findOne({
        where: {
          id: +param.userId,
        },
      });
      if (!!!userUpdating) {
        throw new HttpException('잘못된 요청입니다', HttpStatus.BAD_REQUEST);
      }
      userUpdating.nickname =
        updateUserInfoDto.nickname || userUpdating.nickname;
      userUpdating.password = updateUserInfoDto.password
        ? await bcrypt.hash(updateUserInfoDto.password, 10)
        : userUpdating.password;
      userUpdating.phone = updateUserInfoDto.phone || userUpdating.phone;
      userUpdating.role = updateUserInfoDto.role || userUpdating.role;
      await this.usersRepository.save(userUpdating);
      return { message: '성공적으로 회원 정보가 업데이트되었습니다' };
    } catch (e) {
      throw e;
    }
  }

  async deleteUser(param: { userId: string }) {
    try {
      const isExistUserDeleting = await this.usersRepository.exist({
        where: {
          id: +param.userId,
        },
      });
      if (!!!isExistUserDeleting) {
        throw new HttpException(
          '존재하지 않는 회원입니다',
          HttpStatus.NOT_FOUND,
        );
      }
      const result = await this.usersRepository.softDelete({
        id: +param.userId,
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '회원 정보 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 회원 정보가 삭제되었습니다' };
    } catch (e) {
      throw e;
    }
  }
}
