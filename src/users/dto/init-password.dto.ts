import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class InitPasswordDto {
  @IsEmail({}, { message: '올바른 이메일 주소를 입력해주세요' })
  email: string;

  @IsString()
  @Length(2, 13, { message: '2자리에서 13자리의 닉네임을 입력해주세요' })
  nickname: string;

  @Matches(/01[016789]-[^0][0-9]{2,3}-[0-9]{4}/, {
    message: '하이푼(-)을 포함한 휴대폰 형식(010-1234-5678)으로 입력해주세요',
  })
  phone: string;
}
