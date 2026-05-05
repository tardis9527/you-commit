import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key } from './key.entity';

@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(Key)
    private readonly keyRepo: Repository<Key>,
  ) {}

  async activate(keyStr: string, machineId: string): Promise<{ remaining: number; total: number }> {
    const key = await this.keyRepo.findOne({ where: { key: keyStr } });
    if (!key) {
      throw new NotFoundException('密钥无效');
    }

    if (key.machineId && key.machineId !== machineId) {
      throw new ForbiddenException('该密钥已绑定其他设备');
    }

    if (!key.machineId) {
      key.machineId = machineId;
      key.activatedAt = new Date();
      await this.keyRepo.save(key);
    }

    return { remaining: key.total - key.used, total: key.total };
  }

  async getQuota(keyStr: string, machineId: string): Promise<{ remaining: number; total: number }> {
    // Aggregate all keys bound to this machine
    const keys = await this.keyRepo.find({ where: { machineId } });
    if (keys.length === 0) {
      throw new NotFoundException('该设备没有绑定任何密钥');
    }

    let total = 0;
    let used = 0;
    for (const k of keys) {
      total += k.total;
      used += k.used;
    }

    return { remaining: total - used, total };
  }

  async consumeOne(machineId: string): Promise<void> {
    // Find the oldest key with remaining quota for this machine
    const key = await this.keyRepo
      .createQueryBuilder('k')
      .where('k.machine_id = :machineId', { machineId })
      .andWhere('k.used < k.total')
      .orderBy('k.activated_at', 'ASC')
      .getOne();

    if (!key) {
      throw new BadRequestException('额度已用完，请购买新密钥');
    }

    key.used += 1;
    await this.keyRepo.save(key);
  }

  async hasQuota(machineId: string): Promise<boolean> {
    const key = await this.keyRepo
      .createQueryBuilder('k')
      .where('k.machine_id = :machineId', { machineId })
      .andWhere('k.used < k.total')
      .getOne();

    return !!key;
  }
}
