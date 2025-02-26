import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlaceEntity } from './place.entity';
import { ReviewWeightEntity } from './review_weight.entity';

@Entity({ name: 'place_review' })
export class PlaceReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  place_uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  place_name: string;

  @ManyToOne(() => PlaceEntity, (place) => place.placeThemes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'place_uuid', referencedColumnName: 'uuid' })
  place: PlaceEntity;

  @OneToMany(() => ReviewWeightEntity, (rw) => rw.placeReview, { cascade: true })
  reviewWeights: ReviewWeightEntity[];
}
