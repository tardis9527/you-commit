import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('keys')
export class Key {
  @PrimaryColumn({ length: 20 })
  key!: string;

  @Column({ name: 'machine_id', type: 'varchar', length: 255, nullable: true })
  machineId!: string | null;

  @Column()
  total!: number;

  @Column({ default: 0 })
  used!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'activated_at', type: 'timestamptz', nullable: true })
  activatedAt!: Date | null;
}
