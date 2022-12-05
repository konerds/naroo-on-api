import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

const CONST_RESOURCE_TYPE = {
  ADMIN_EMAIL: 'admin_email',
  HEADER_LOGO: 'header_logo',
  FOOTER_LOGO: 'footer_logo',
  INFO_BANNER: 'info_banner',
  ORG_CAROUSEL: 'org_carousel',
} as const;

export type RESOURCE_TYPE =
  typeof CONST_RESOURCE_TYPE[keyof typeof CONST_RESOURCE_TYPE];

@Entity()
export class Resource {
  @PrimaryColumn('enum', {
    enum: CONST_RESOURCE_TYPE,
  })
  type: RESOURCE_TYPE;

  @PrimaryGeneratedColumn()
  content_id: number;

  @Column()
  content: string;
}
