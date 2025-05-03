import { CourseEntity } from 'src/entities/course.entity';
import { PlaceEntity } from 'src/entities/place.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'course_detail' })
export class CourseDetailEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 32, nullable: false })
  course_uuid: string; // FK -> course.uuid

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'char', length: 32, nullable: false })
  place_uuid: string; // FK -> place.uuid

  @Column({ type: 'varchar', length: 100, nullable: false })
  place_name: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  place_type: string;

  @CreateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ManyToOne(() => CourseEntity, (course) => course.courseDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_uuid', referencedColumnName: 'uuid' })
  course: CourseEntity;

  @ManyToOne(() => PlaceEntity, (place) => place.courseDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'place_uuid', referencedColumnName: 'uuid' })
  place: PlaceEntity;
}
