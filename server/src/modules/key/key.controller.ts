import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { KeyService } from './key.service';
import { ActivateKeyDto, QuotaQueryDto } from './key.dto';

@Controller('api')
export class KeyController {
  constructor(private readonly keyService: KeyService) {}

  @Post('activate')
  async activate(@Body() dto: ActivateKeyDto) {
    return this.keyService.activate(dto.key, dto.machineId);
  }

  @Get('quota')
  async quota(@Query() dto: QuotaQueryDto) {
    return this.keyService.getQuota(dto.key, dto.machineId);
  }
}
