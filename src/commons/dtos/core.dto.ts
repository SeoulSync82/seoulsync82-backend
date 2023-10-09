import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CoreOutput {
  @IsBoolean()
  @IsNotEmpty()
  ok: boolean;

  @IsString()
  @IsOptional()
  error?: string;
}