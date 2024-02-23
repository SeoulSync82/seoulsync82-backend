import { PickType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CoreOutput } from 'src/commons/dtos/core.dto';
import { UserEntity } from 'src/entities/user.entity';

export class ValidateAuthInputDto extends PickType(UserEntity, ['email']) {}

export class ValidateAuthOutputDto extends CoreOutput {
  @IsOptional()
  data?: UserEntity;
}
