import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  machineId!: string;

  @IsString()
  @IsNotEmpty()
  systemPrompt!: string;

  @IsString()
  @IsNotEmpty()
  userPrompt!: string;
}
