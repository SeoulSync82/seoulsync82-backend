import { Column, Entity, Generated, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CourseDetailEntity } from './course.detail.entity';
import { MyCourseEntity } from './my_course.entity';

@Entity({ name: 'course' })
export class CourseEntity {
  @Column({ type: 'integer' })
  @Generated('increment')
  id: number;

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  subway: string;

  @Column()
  line: string;

  @Column()
  user_uuid: string;

  @Column()
  user_name: string;

  @Column()
  count: number;

  @Column()
  customs: string;

  @Column()
  image: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @OneToMany(() => CourseDetailEntity, (courseDetail) => courseDetail.course)
  courseDetails: CourseDetailEntity[];

  @OneToMany(() => MyCourseEntity, (myCourse) => myCourse.course)
  myCourses: MyCourseEntity[];
}
