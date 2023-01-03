import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: '올바른 이메일 주소를 입력해주세요' })
  email: string;

  @IsNotEmpty({ message: '비밀번호를 입력해주세요' })
  password: string;
}
