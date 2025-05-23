import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ApiCommentPostRequestBodyDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    example: '오오 이코스 참 좋네요',
    description: '한줄평',
  })
  comment: string;
}
