import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'course_detail' })
export class CourseDetailEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  course_uuid: string;

  @Column()
  sort: number;

  @Column()
  place_uuid: string;

  @Column()
  place_name: string;

  @Column()
  place_type: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
