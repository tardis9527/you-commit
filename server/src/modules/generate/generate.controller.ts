import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { GenerateService } from './generate.service';
import { GenerateDto } from './generate.dto';

@Controller('api')
export class GenerateController {
  constructor(private readonly generateService: GenerateService) {}

  @Post('generate')
  async generate(@Body() dto: GenerateDto, @Res() res: Response) {
    return this.generateService.generate(
      dto.key,
      dto.machineId,
      dto.systemPrompt,
      dto.userPrompt,
      res,
    );
  }
}
