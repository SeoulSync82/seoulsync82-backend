import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'notice' })
export class NoticeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 32, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ type: 'longtext', nullable: true })
  content: string;

  @Column('datetime', { nullable: true })
  published_at: Date;

  @Column('datetime', { nullable: true })
  archived_at: Date;

  @CreateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
