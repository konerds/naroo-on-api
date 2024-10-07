import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class WithTimestamps {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
