import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class SignUpDto {
  @IsEmail({}, { message: '이메일 주소를 입력해주세요!' })
  email: string;

  @Matches(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,16}$/,
    {
      message:
        '비밀번호를 최소 하나의 영문자, 숫자, 특수문자를 포함한 8자리에서 16자리의 형식으로 입력해주세요!',
    },
  )
  password: string;

  @IsString({ message: '닉네임을 문자열 형식으로 입력해주세요!' })
  @Length(2, 13, { message: '2자리에서 13자리의 닉네임을 입력해주세요!' })
  nickname: string;

  @Matches(/01[016789]-[^0][0-9]{2,3}-[0-9]{4}/, {
    message: '하이푼(-)을 포함한 휴대폰 형식(010-1234-5678)으로 입력해주세요!',
  })
  phone: string;

  @IsString({ message: '이메일 수신 동의 여부를 선택해주세요!' })
  isAgreeEmail: string;
}
