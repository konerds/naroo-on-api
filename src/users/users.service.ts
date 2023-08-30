import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CONST_ROLE_TYPE, ROLE_TYPE, User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as UUID } from 'uuid';
import { InitPasswordDto } from './dto/init-password.dto';
import { config } from 'dotenv';
import { Repository } from 'typeorm';
import { MailgunService } from 'nestjs-mailgun';
config();

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailgunService: MailgunService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    if (process.env.IS_SYNC === 'Y') {
      this.createAdminUser();
    }
  }

  async createAdminUser() {
    const existAdminUser = await this.usersRepository.findOne({
      where: { role: CONST_ROLE_TYPE.ADMIN },
    });
    if (!!!existAdminUser) {
      const hashedPassword = await bcrypt.hash(
        process.env.PASSWORD_FIRST_ADMIN,
        10,
      );
      await this.usersRepository.save({
        role: CONST_ROLE_TYPE.ADMIN,
        email: 'admin@test.com',
        nickname: '관리자',
        password: hashedPassword,
        phone: '010-0000-0000',
        isAgreeEmail: true,
        isAuthorized: true,
        verifyToken: null,
      });
    }
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const hashedPassword = await bcrypt.hash(signUpDto.password, 10);
      if (!signUpDto.phone.match(/^[0-9]{3}[-]+[0-9]{4}[-]+[0-9]{4}$/)) {
        throw new HttpException(
          '휴대폰 번호를 정확하게 입력해주세요',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      const isUniquePhone = await this.usersRepository.findOne({
        where: { phone: signUpDto.phone },
      });
      if (!!isUniquePhone) {
        throw new HttpException(
          '등록된 휴대폰 번호가 존재합니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const isUniqueEmail = await this.usersRepository.findOne({
        where: { email: signUpDto.email },
      });
      if (!!isUniqueEmail) {
        throw new HttpException(
          '등록된 이메일 주소가 존재합니다',
          HttpStatus.BAD_REQUEST,
        );
      }
      const verifyToken = UUID();
      const user = this.usersRepository.create({
        email: signUpDto.email,
        nickname: signUpDto.nickname,
        password: hashedPassword,
        phone: signUpDto.phone,
        isAgreeEmail: signUpDto.isAgreeEmail === 'true' ? true : false,
        isAuthorized: false,
        verifyToken: verifyToken,
      });
      await this.sendVerifyEmail(user);
      const result = this.usersRepository.save(user);
      if (!!!result) {
        throw new HttpException(
          '회원 등록에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '발송된 메일을 통해 이메일 인증을 완료해주세요' };
    } catch (err) {
      throw err;
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          email: signInDto.email,
        },
        select: ['id', 'email', 'password', 'isAuthorized', 'verifyToken'],
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
      const checkPassword = await bcrypt.compare(
        signInDto.password,
        user.password,
      );
      if (!checkPassword) {
        throw new HttpException(
          '비밀번호가 일치하지 않습니다',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const token = this.jwtService.sign({ id: user.id });
      return { token };
    } catch (err) {
      throw err;
    }
  }

  async sendVerifyEmail(user: User) {
    try {
      const domain = this.configService.get<string>('MAILGUN_DOMAIN');
      await this.mailgunService.createEmail(domain, {
        to: user.email,
        from: this.configService.get<string>('MAILGUN_USER') + '@' + domain,
        subject:
          '나루온 회원이 되신 것을 축하합니다, 제공된 링크를 통해 이메일 인증 요청을 완료해주세요',
        html: `<a style="background-color:black;color:white;border-radius:20px;padding:15px;display:block;margin:auto;width:300px" href="${process.env.FRONT_URL}/verify/${user.verifyToken}">이메일 인증하기</a>`,
      });
    } catch (err) {
      throw new HttpException(
        '인증 메일을 전송하는 데 오류가 발생하였습니다',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyCode(param: { requestToken: string }) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          verifyToken: param.requestToken,
        },
      });
      if (!!!user)
        throw new HttpException(
          '잘못된 인증 요청입니다',
          HttpStatus.UNAUTHORIZED,
        );
      user.verifyToken = null;
      user.isAuthorized = true;
      const result = await this.usersRepository.save(user);
      const token = this.jwtService.sign({ id: result.id });
      return { token };
    } catch (err) {
      throw err;
    }
  }

  async sendInitPassword(initPasswordDto: InitPasswordDto) {
    try {
      const user = await this.usersRepository.findOne({
        where: {
          email: initPasswordDto.email,
          nickname: initPasswordDto.nickname,
          phone: initPasswordDto.phone,
        },
      });
      if (!!!user)
        throw new HttpException(
          '존재하지 않는 계정입니다',
          HttpStatus.NOT_FOUND,
        );
      const randomPassword = UUID().substr(0, 16);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user.password = hashedPassword;
      const domain = this.configService.get<string>('MAILGUN_DOMAIN');
      await this.mailgunService.createEmail(domain, {
        to: user.email,
        from: this.configService.get<string>('MAILGUN_USER') + '@' + domain,
        subject: '나루온 비밀번호 재설정 메일',
        html: `<div><p style="font-size:1rem;">${user.nickname} / ${user.email} 계정의 임시 비밀번호는 <span style="color:blue;">${randomPassword}</span> 입니다</p><p style="margin-top:5px;color:red;font-size:0.7rem">보안을 위해 반드시 로그인하신 후 비밀번호를 재설정해주세요!</p></div>`,
      });
      const result = await this.usersRepository.save(user);
      if (!!!result) {
        throw new HttpException(
          '비밀번호 초기화에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return {
        message: '보안을 위해 반드시 로그인하신 후 비밀번호를 재설정해주세요',
      };
    } catch (err) {
      throw err;
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
      const student = await this.usersRepository.findOne({
        where: { id: +user.id },
        select: ['id', 'email', 'nickname', 'phone'],
      });
      if (!!!student) {
        throw new HttpException(
          '존재하지 않는 계정입니다',
          HttpStatus.NOT_FOUND,
        );
      }
      return student;
    } catch (err) {
      throw err;
    }
  }

  async findAllUsers() {
    try {
      const users = await this.usersRepository.find({
        select: ['id', 'email', 'nickname', 'phone', 'role'],
      });
      if (users.length === 0) {
        return null;
      }
      return users;
    } catch (err) {
      throw err;
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
      const existUpdateUser = await this.usersRepository.findOne({
        where: {
          id: user.id,
        },
      });
      if (!!!existUpdateUser) {
        throw new HttpException('잘못된 요청입니다', HttpStatus.BAD_REQUEST);
      }
      existUpdateUser.nickname = updateUserInfoDto.nickname
        ? updateUserInfoDto.nickname
        : existUpdateUser.nickname;
      existUpdateUser.password = updateUserInfoDto.password
        ? await bcrypt.hash(updateUserInfoDto.password, 10)
        : existUpdateUser.password;
      existUpdateUser.phone = updateUserInfoDto.phone
        ? updateUserInfoDto.phone
        : existUpdateUser.phone;
      existUpdateUser.role = updateUserInfoDto.role
        ? updateUserInfoDto.role
        : existUpdateUser.role;
      const result = await this.usersRepository.save(existUpdateUser);
      if (!!!result) {
        throw new HttpException(
          '회원 정보 업데이트에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 회원 정보가 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async updateUserInfoForAdmin(
    param: { userId: string },
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
      if (
        typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.ADMIN
      ) {
        throw new HttpException('관리자 권한이 없습니다', HttpStatus.FORBIDDEN);
      }
      const existUpdateUser = await this.usersRepository.findOne({
        where: {
          id: +param.userId,
        },
      });
      if (!!!existUpdateUser) {
        throw new HttpException('잘못된 요청입니다', HttpStatus.BAD_REQUEST);
      }
      existUpdateUser.nickname = updateUserInfoDto.nickname
        ? updateUserInfoDto.nickname
        : existUpdateUser.nickname;
      existUpdateUser.password = updateUserInfoDto.password
        ? await bcrypt.hash(updateUserInfoDto.password, 10)
        : existUpdateUser.password;
      existUpdateUser.phone = updateUserInfoDto.phone
        ? updateUserInfoDto.phone
        : existUpdateUser.phone;
      existUpdateUser.role = updateUserInfoDto.role
        ? updateUserInfoDto.role
        : existUpdateUser.role;
      const result = await this.usersRepository.save(existUpdateUser);
      if (!!!result) {
        throw new HttpException(
          '회원 정보 업데이트에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 회원 정보가 업데이트되었습니다' };
    } catch (err) {
      throw err;
    }
  }

  async deleteUser(param: { userId: string }, user: User) {
    try {
      if (
        typeof user.role === typeof CONST_ROLE_TYPE &&
        user.role !== CONST_ROLE_TYPE.ADMIN
      ) {
        throw new HttpException('관리자 권한이 없습니다', HttpStatus.FORBIDDEN);
      }
      const existDeleteUser = await this.usersRepository.findOne({
        where: {
          id: +param.userId,
        },
      });
      if (!!!existDeleteUser) {
        throw new HttpException(
          '존재하지 않는 회원입니다',
          HttpStatus.NOT_FOUND,
        );
      }
      const result = await this.usersRepository.softDelete({
        id: existDeleteUser.id,
      });
      if (!(!!result && result.affected === 1)) {
        throw new HttpException(
          '회원 정보 삭제에 실패하였습니다',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      return { message: '성공적으로 회원 정보가 삭제되었습니다' };
    } catch (err) {
      throw err;
    }
  }
}
