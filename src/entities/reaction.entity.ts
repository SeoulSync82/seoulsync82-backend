import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommunityEntity } from './community.entity';

@Entity({ name: 'reaction' })
export class ReactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  target_uuid: string;

  @Column()
  user_name: string;

  @Column()
  @Column('tinyint', {
    name: 'like',
    default: () => 1,
  })
  like: number;

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

  @ManyToOne(() => CommunityEntity, (community) => community.reactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'target_uuid' })
  community: CommunityEntity;
}
