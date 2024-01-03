import { Column, Entity, Generated, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CourseDetailEntity } from './course.detail.entity';
import { BookmarkEntity } from './bookmark.entity';

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
  course_image: string;

  @Column()
  course_name: string;

  @Column()
  user_uuid: string;

  @Column()
  user_name: string;

  @Column()
  count: number;

  @Column()
  customs: string;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @OneToMany(() => CourseDetailEntity, (courseDetail) => courseDetail.course)
  courseDetails: CourseDetailEntity[];

  @OneToMany(() => BookmarkEntity, (myCourse) => myCourse.course)
  myCourses: BookmarkEntity[];
}
