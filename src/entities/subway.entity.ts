import { PlaceEntity } from 'src/entities/place.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'subway' })
export class SubwayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 32, nullable: false })
  place_uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  place_name: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  place_type: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  line: string;

  @Column({ type: 'int', default: 0 })
  kakao_rating: number;

  @ManyToOne(() => PlaceEntity, (place) => place.subways, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'place_uuid', referencedColumnName: 'uuid' })
  place: PlaceEntity;
}
