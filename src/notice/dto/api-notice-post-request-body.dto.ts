import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString, Length } from 'class-validator';

export class ApiNoticePostRequestBodyDto {
  @IsNotEmpty()
  @IsString()
  @Length(1)
  @ApiProperty({
    example: '서울싱크 이용약관 개정안내',
    description: '공지사항 제목',
  })
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(1)
  @ApiProperty({
    example: `안녕하세요. 서울싱크82 입니다.

서울싱크82 서비스를 이용해주시는 회원분들께 감사드리며, 개정에 대해 주요내용을 안내드리오니 서비스이용에 참고하시기 바랍니다.
본 약관은 관련 법령에 따라 서울싱크82의 의무와 책임을 회원 여러분께 명확하게 설명하기 위해 개정되었습니다.`,
    description: '공지사항 내용',
  })
  content: string;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    example: '2025-05-02 00:00:00',
    description: '게시일자',
  })
  published_at: Date;
}
