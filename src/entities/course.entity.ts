import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'course' })
export class CourseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  user_name: string;

  @Column()
  count: number;

  @Column()
  image: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
