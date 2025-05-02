import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApiNoticeGetResponseDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '공지사항 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '00145054384a4b0d85b4198c6e54404f',
    description: '공지사항 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '공지사항 제목',
    description: '이건 공지사항 입니다',
  })
  title: string;

  @Expose()
  @ApiProperty({
    example: '2025-05-02 00:00:00',
    description: '게시일',
  })
  published_at: Date;
}
