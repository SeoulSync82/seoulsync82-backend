import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from '../decorators/to-boolean.decorator';

export class CoreOutput {
  @IsBoolean()
  @IsNotEmpty()
  @ToBoolean()
  ok: boolean;

  @IsString()
  @IsOptional()
  error?: string;
}
