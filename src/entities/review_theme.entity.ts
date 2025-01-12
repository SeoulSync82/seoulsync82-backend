import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'place_review' }) // 테이블 이름
export class PlaceReviewEntity {
  @PrimaryGeneratedColumn()
  id: number; // 기본 키 (자동 증가)

  @Column({ type: 'varchar', length: 32, nullable: true })
  comment_uuid: string; // 댓글 UUID

  @Column({ type: 'varchar', length: 32, nullable: true })
  place_uuid: string; // 장소 UUID

  @Column({ type: 'float', nullable: true })
  vibe: number; // 분위기 점수

  @Column({ type: 'float', nullable: true })
  photo: number; // 사진 점수

  @Column({ type: 'float', nullable: true })
  price: number; // 가성비 점수

  @Column({ type: 'float', nullable: true })
  alone: number; // 혼자 가기 좋은 점수

  @Column({ type: 'float', nullable: true })
  clean: number; // 청결 점수

  @Column({ type: 'float', nullable: true })
  kind: number; // 친절 점수

  @Column({ type: 'float', nullable: true })
  parking: number; // 주차 가능 점수
}
