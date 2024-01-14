import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'community' })
export class CommunityEntity {
  @Column({ type: 'integer' })
  @Generated('increment')
  id: number;

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  user_name: string;

  @Column()
  course_uuid: string;

  @Column()
  course_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 1 })
  score: number;

  @Column()
  review: string;

  @Column()
  archived_at: Date;

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
