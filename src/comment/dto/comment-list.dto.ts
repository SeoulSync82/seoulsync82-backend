import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CommentListDto {
  @Expose()
  @ApiProperty({
    example: 1,
    description: '댓글 id',
  })
  id: number;

  @Expose()
  @ApiProperty({
    example: '6e6df92a8af35a16af80c358d73d54bb',
    description: '댓글 uuid',
  })
  uuid: string;

  @Expose()
  @ApiProperty({
    example: '2871948cc25b589ea0a672a6f060fae3',
    description: '유저 uuid',
  })
  user_uuid: string;

  @Expose()
  @ApiProperty({
    example: '유승모',
    description: '유저 이름',
    required: false,
  })
  user_name: string;

  @Expose()
  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/a/ACg8ocKAb6iB4pEMNzQ-IjQJHMEvhxKC8tDHn5VL0FIlDK2v=s96-c',
    description: '유저 이미지',
    required: false,
  })
  user_profile_image: string;

  @Expose()
  @ApiProperty({
    example: '오오 여기 좋아요',
    description: '댓글',
  })
  comment: string;

  @Expose()
  @ApiProperty({
    example: true,
    description: '해당 댓글의 작성자 여부',
  })
  isAuthor: true;

  @Expose()
  @ApiProperty({
    example: '2023-10-21 00:00:00',
    description: '생성일',
  })
  created_at: Date;
}
