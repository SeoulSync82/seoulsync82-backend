import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
  linked: number;

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
