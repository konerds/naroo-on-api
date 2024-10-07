import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { WithTimestamps } from '../../common/entity/with-timestamps.entity';

const CONST_RESOURCE_TYPE = {
  ADMIN_EMAIL: 'admin_email',
  HEADER_LOGO: 'header_logo',
  FOOTER_LOGO: 'footer_logo',
  INFO_BANNER: 'info_banner',
  ORG_CAROUSEL: 'org_carousel',
} as const;

export type RESOURCE_TYPE =
  (typeof CONST_RESOURCE_TYPE)[keyof typeof CONST_RESOURCE_TYPE];

@Entity()
export class Resource extends WithTimestamps {
  @Column('varchar', { nullable: false })
  type: RESOURCE_TYPE;

  @PrimaryGeneratedColumn()
  content_id: number;

  @Column()
  content: string;
}
