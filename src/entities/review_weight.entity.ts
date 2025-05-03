import { PlaceReviewEntity } from 'src/entities/place_review.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'review_weight' })
export class ReviewWeightEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32, nullable: false })
  review_uuid: string;

  @Column({ type: 'varchar', length: 32, nullable: false })
  place_uuid: string;

  @Column({ type: 'float', nullable: false })
  vibe: number; // 분위기 점수

  @Column({ type: 'float', nullable: false })
  photo: number; // 사진 점수

  @Column({ type: 'float', nullable: false })
  price: number; // 가성비 점수

  @Column({ type: 'float', nullable: false })
  alone: number; // 혼자 가기 좋은 점수

  @Column({ type: 'float', nullable: false })
  clean: number; // 청결 점수

  @Column({ type: 'float', nullable: false })
  kind: number; // 친절 점수

  @Column({ type: 'float', nullable: false })
  parking: number; // 주차 가능 점수

  @ManyToOne(() => PlaceReviewEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'review_uuid', referencedColumnName: 'uuid' })
  placeReview: PlaceReviewEntity;
}
