import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CommentListDto } from 'src/comment/dto/comment-list.dto';

export class ApiCommentGetResponseDto {
  @Expose()
  @ApiProperty({
    example: '코스 좋아요 좋아!',
    description: '게시글 메인 한줄 리뷰',
  })
  community_review: string;

  @Expose()
  @ApiProperty({
    example: '2871948cc25b589ea0a672a6f060fae3',
    description: '유저 uuid',
  })
  community_user_uuid: string;

  @Expose()
  @ApiProperty({
    example: '유승모',
    description: '유저 이름',
    required: false,
  })
  community_user_name: string;

  @Expose()
  @ApiProperty({
    example:
      'https://lh3.googleusercontent.com/a/ACg8ocKAb6iB4pEMNzQ-IjQJHMEvhxKC8tDHn5VL0FIlDK2v=s96-c',
    description: '유저 이미지',
    required: false,
  })
  community_user_profile_image: string;

  @Expose()
  @ApiProperty({
    type: [CommentListDto],
    description: '댓글 데이터 배열',
  })
  @Type(() => CommentListDto)
  comments: CommentListDto[];

  @Expose()
  @ApiProperty({
    example: 3,
    description: '마지막 댓글 id',
  })
  last_item_id: number;
}
