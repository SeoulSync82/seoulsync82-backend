
import { IsOptional, IsString } from 'class-validator';
import { PickType } from '@nestjs/mapped-types';
import { CoreOutput } from 'src/commons/dtos/core.dto';
import { UserEntity } from 'src/entites/user.entity';

// export class GoogleLoginAuthInputDto extends PickType(UserEntity, ['email', 'firstName', 'lastName', 'photo']) {}

export class GoogleLoginAuthOutputDto extends CoreOutput {
  @IsOptional()
  @IsString()
  accessToken?: string;
}