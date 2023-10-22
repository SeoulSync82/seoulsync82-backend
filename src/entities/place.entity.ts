import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'place' })
export class PlaceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uuid: string;

  @Column()
  place_name: string;

  @Column()
  place_type: string;

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
}
