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

@Entity({ name: 'reaction' })
export class ReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 32, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'char', length: 32, nullable: false })
  user_uuid: string;

  @Column({ type: 'char', length: 32, nullable: false })
  target_uuid: string; // FK to community

  @Column({ type: 'varchar', length: 50, nullable: false })
  user_name: string;

  @Column({ type: 'tinyint', default: 1 })
  like: number;

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

  @ManyToOne(() => CommunityEntity, (community) => community.reactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'target_uuid', referencedColumnName: 'uuid' })
  community: CommunityEntity;
}
