import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Key } from './key.entity';

@Injectable()
export class KeyService {
  constructor(
    @InjectRepository(Key)
    private readonly keyRepo: Repository<Key>,
  ) {}

  async activate(keyStr: string, _machineId: string): Promise<{ remaining: number; total: number }> {
    const key = await this.findKeyOrThrow(keyStr);

    if (!key.activatedAt) {
      key.activatedAt = new Date();
      await this.keyRepo.save(key);
    }

    return this.toQuota(key);
  }

  async getQuota(keyStr: string, _machineId: string): Promise<{ remaining: number; total: number }> {
    const key = await this.findKeyOrThrow(keyStr);
    return this.toQuota(key);
  }

  async consumeOne(keyStr: string): Promise<void> {
    const result = await this.keyRepo
      .createQueryBuilder()
      .update(Key)
      .set({ used: () => '"used" + 1' })
      .where('"key" = :keyStr', { keyStr })
      .andWhere('"used" < "total"')
      .execute();

    if (!result.affected) {
      const key = await this.keyRepo.findOne({ where: { key: keyStr } });
      if (!key) {
        throw new NotFoundException('Invalid service key');
      }
      throw new BadRequestException('Quota exhausted, please purchase a new key');
    }
  }

  async ensureHasQuota(keyStr: string): Promise<void> {
    const key = await this.findKeyOrThrow(keyStr);
    if (key.used >= key.total) {
      throw new BadRequestException('Quota exhausted, please purchase a new key');
    }
  }

  async hasQuota(keyStr: string): Promise<boolean> {
    const key = await this.keyRepo
      .createQueryBuilder('k')
      .where('k.key = :keyStr', { keyStr })
      .andWhere('k.used < k.total')
      .getOne();

    return !!key;
  }

  private async findKeyOrThrow(keyStr: string): Promise<Key> {
    const key = await this.keyRepo.findOne({ where: { key: keyStr } });
    if (!key) {
      throw new NotFoundException('Invalid service key');
    }
    return key;
  }

  private toQuota(key: Key): { remaining: number; total: number } {
    return { remaining: Math.max(key.total - key.used, 0), total: key.total };
  }
}
