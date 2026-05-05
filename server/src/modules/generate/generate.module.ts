import { Module } from '@nestjs/common';
import { GenerateController } from './generate.controller';
import { GenerateService } from './generate.service';
import { KeyModule } from '../key/key.module';
import { ChannelModule } from '../channel/channel.module';

@Module({
  imports: [KeyModule, ChannelModule],
  controllers: [GenerateController],
  providers: [GenerateService],
})
export class GenerateModule {}
