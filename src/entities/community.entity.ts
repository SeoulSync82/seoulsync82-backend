import { Expose } from 'class-transformer';
import { CommentEntity } from 'src/entities/comment.entity';
import { ReactionEntity } from 'src/entities/reaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'community' })
export class CommunityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 32, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'char', length: 32, nullable: false })
  user_uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  user_name: string;

  @Column({ type: 'char', length: 32, nullable: false })
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
  is_liked: boolean;

  @OneToMany(() => ReactionEntity, (reaction) => reaction.community, { cascade: true })
  reactions: ReactionEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.community, { cascade: true })
  comments: CommentEntity[];
}
