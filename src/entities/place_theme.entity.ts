import { PlaceEntity } from 'src/entities/place.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'place_theme' })
export class PlaceThemeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: false })
  place_uuid: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  place_name: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  theme_uuid: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  theme_name: string;

  @Column({ type: 'float', default: 0 })
  weight: number;

  @ManyToOne(() => PlaceEntity, (place) => place.placeThemes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'place_uuid', referencedColumnName: 'uuid' })
  place: PlaceEntity;
}
