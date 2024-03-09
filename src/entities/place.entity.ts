import { Column, Entity, Generated, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CourseDetailEntity } from './course.detail.entity';
import { SubwayEntity } from './subway.entity';

@Entity({ name: 'place' })
export class PlaceEntity {
  @Column({ type: 'integer' })
  @Generated('increment')
  id: number;

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  place_name: string;

  @Column()
  place_type: string;

  @Column()
  operation_time: string;

  @Column()
  closed_days: string;

  @Column()
  entrance_fee: string;

  @Column()
  thumbnail: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column()
  address: string;

  @Column()
  tel: string;

  @Column()
  url: string;

  @Column({ type: 'decimal', precision: 10, scale: 1 })
  score: number;

  @Column('tinyint', {
    name: 'kakao_rating',
    default: () => 0,
  })
  kakao_rating: number;

  @Column()
  review_count: number;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column()
  cate_name_depth1: string;

  @Column()
  cate_name_depth2: string;

  @Column()
  cate_name_depth3: string;

  @Column()
  brandname: string;

  @Column()
  mainbrand: string;

  @Column()
  hashtag: string;

  @Column()
  top_level_address: string;

  @OneToMany(() => SubwayEntity, (subway) => subway.place)
  subways: SubwayEntity[];

  @OneToMany(() => CourseDetailEntity, (courseDetail) => courseDetail.place)
  courseDetails: CourseDetailEntity[];
}
