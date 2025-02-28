import { BookmarkEntity } from 'src/entities/bookmark.entity';
import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'course' })
export class CourseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  subway: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  line: string;

  @Column({ type: 'text', nullable: true })
  course_image: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  course_name: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  user_uuid: string; // 비회원

  @Column({ type: 'varchar', length: 100, nullable: false })
  user_name: string;

  @Column({ type: 'int', default: 0 })
  count: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  theme: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  customs: string;

  @CreateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @OneToMany(() => CourseDetailEntity, (courseDetail) => courseDetail.course)
  courseDetails: CourseDetailEntity[];

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.course)
  bookmarks: BookmarkEntity[];
}
