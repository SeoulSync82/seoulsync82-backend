import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PlaceEntity } from './place.entity';

@Entity({ name: 'subway' })
export class SubwayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  place_uuid: string;

  @Column()
  place_name: string;

  @Column()
  place_type: string;

  @Column()
  name: string;

  @Column()
  line: string;

  @Column()
  kakao_rating: number;

  @ManyToOne(() => PlaceEntity, (place) => place.subways)
  @JoinColumn({ name: 'place_uuid', referencedColumnName: 'uuid' })
  place: PlaceEntity;
}
