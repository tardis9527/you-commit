import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiChannel } from './channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(AiChannel)
    private readonly channelRepo: Repository<AiChannel>,
  ) {}

  async getActiveChannel(): Promise<AiChannel> {
    const channel = await this.channelRepo.findOne({
      where: { isActive: true },
      order: { priority: 'DESC' },
    });

    if (!channel) {
      throw new Error('没有可用的 AI 渠道，请在数据库中配置');
    }

    return channel;
  }

  async getAllChannels(): Promise<AiChannel[]> {
    return this.channelRepo.find({ order: { priority: 'DESC' } });
  }
}
