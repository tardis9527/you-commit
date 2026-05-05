import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('ai_channels')
export class AiChannel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50 })
  name!: string;

  @Column({ name: 'base_url', length: 255 })
  baseUrl!: string;

  @Column({ name: 'api_key', length: 255 })
  apiKey!: string;

  @Column({ length: 100 })
  model!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ default: 0 })
  priority!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
