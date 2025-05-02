import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ApiUserPutUpdateRequestBodyDto {
  @IsOptional()
  @IsString()
  @Length(1, 20)
  @ApiProperty({
    example: '대파',
    description: '유저 이름',
    required: false,
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '123',
    description: '유저 이미지',
    required: false,
  })
  profile_image?: string;
}
