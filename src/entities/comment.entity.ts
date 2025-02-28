import { CommunityEntity } from 'src/entities/community.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'comment' })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  user_uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  user_name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  comment: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  target_uuid: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  target_user_uuid: string;

  @Column({ type: 'datetime', nullable: true })
  archived_at: Date;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => CommunityEntity, (community) => community.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_uuid', referencedColumnName: 'uuid' })
  community: CommunityEntity;
}
