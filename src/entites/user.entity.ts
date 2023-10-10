import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export enum Provider {
  Local,
  Google,
}
@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  public photo?: string;

  @Column({ type: 'enum', enum: Provider, default: Provider.Local })
  public provider: Provider;

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

  @Column()
  eid: string;

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
