import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsOptional, IsString } from 'class-validator';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ nullable: true })
  // @IsOptional()
  // @IsString()
  // public photo?: string;

  // @Column({ type: 'enum', enum: Provider, default: Provider.Local })
  // public provider: Provider;

  @Column()
  uuid: string;

  @Column()
  name: string;

  @Column()
  profile_image: string;

  @Column()
  email: string;

  @Column()
  type: string;

  @Column('tinyint', {
    name: 'archived',
    default: () => 0,
  })
  archived: number;

  @Column()
  eid_refresh_token: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column('datetime', {
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
