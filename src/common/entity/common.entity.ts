import { PrimaryGeneratedColumn } from 'typeorm';
import { WithTimestamps } from './with-timestamps.entity';

export class Common extends WithTimestamps {
  @PrimaryGeneratedColumn()
  id: number;
}
