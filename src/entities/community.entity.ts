import { Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentEntity } from './comment.entity';
import { ReactionEntity } from './reaction.entity';

@Entity({ name: 'community' })
export class CommunityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  user_uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  user_name: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  course_uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  course_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 1, default: 0 })
  score: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  review: string;

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

  @Expose()
  like_count: number;

  @Expose()
  isLiked: boolean;

  @OneToMany(() => ReactionEntity, (reaction) => reaction.community, { cascade: true })
  reactions: ReactionEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.community, { cascade: true })
  comments: CommentEntity[];
}
