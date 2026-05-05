import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateKeyDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  machineId!: string;
}

export class QuotaQueryDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  machineId!: string;
}
