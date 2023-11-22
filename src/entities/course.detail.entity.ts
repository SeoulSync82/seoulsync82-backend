import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CourseEntity } from './course.entity';

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

  @ManyToOne(() => CourseEntity, (Course) => Course.courseDetails)
  @JoinColumn({ name: 'course_uuid', referencedColumnName: 'uuid' })
  Course: CourseEntity;
}
