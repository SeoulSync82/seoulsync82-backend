import { CourseDetailEntity } from 'src/entities/course.detail.entity';
import { PlaceThemeEntity } from 'src/entities/place_theme.entity';
import { SubwayEntity } from 'src/entities/subway.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'place' })
export class PlaceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 32, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  place_name: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  place_type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  operation_time: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  closed_days: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entrance_fee: string;

  @Column({ type: 'text', nullable: true })
  thumbnail: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: false })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: false })
  longitude: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tel: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'decimal', precision: 10, scale: 1, default: 0 })
  score: number;

  @Column('tinyint', { default: 0 })
  kakao_rating: number;

  @Column({ type: 'int', default: null })
  review_count: number;

  @Column({ type: 'datetime', nullable: true })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cate_name_depth1: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cate_name_depth2: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cate_name_depth3: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brandname: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mainbrand: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hashtag: string;

  @Column({ type: 'text', nullable: true })
  contents: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  top_level_address: string;

  @OneToMany(() => SubwayEntity, (subway) => subway.place, { cascade: true })
  subways: SubwayEntity[];

  @OneToMany(() => PlaceThemeEntity, (pt) => pt.place, { cascade: true })
  placeThemes: PlaceThemeEntity[];

  @OneToMany(() => CourseDetailEntity, (cd) => cd.place, { cascade: true })
  courseDetails: CourseDetailEntity[];
}
