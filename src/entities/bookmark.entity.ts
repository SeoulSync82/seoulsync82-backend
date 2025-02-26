import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseEntity } from './course.entity';

@Entity({ name: 'bookmark' })
export class BookmarkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  course_uuid: string; // FK → CourseEntity.uuid

  @Column({ type: 'varchar', length: 20, nullable: false })
  subway: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  line: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  user_uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  user_name: string;

  @Column({ type: 'text', nullable: true })
  course_image: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  course_name: string;

  @Column({ type: 'datetime', nullable: true })
  archived_at: Date;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => CourseEntity, (course) => course.bookmarks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_uuid', referencedColumnName: 'uuid' })
  course: CourseEntity;
}
