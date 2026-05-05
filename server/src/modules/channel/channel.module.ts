import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiChannel } from './channel.entity';
import { ChannelService } from './channel.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiChannel])],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
