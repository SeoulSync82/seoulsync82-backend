import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity({ name: 'my_course' })
export class MyCourseEntity {
  @Column({ type: 'integer' })
  @Generated('increment')
  id: number;

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  course_uuid: string;

  @Column()
  subway: string;

  @Column()
  line: string;

  @Column()
  user_uuid: string;

  @Column()
  user_name: string;

  @Column()
  course_image: string;

  @Column()
  course_name: string;

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

  @ManyToOne(() => CourseEntity, (Course) => Course.myCourses)
  @JoinColumn({ name: 'course_uuid', referencedColumnName: 'uuid' })
  course: CourseEntity;
}
