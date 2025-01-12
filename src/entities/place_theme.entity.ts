import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'place_theme' })
export class PlaceThemeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  place_uuid: string;

  @Column()
  place_name: string;

  @Column()
  theme_uuid: string;

  @Column()
  theme_name: string;

  @Column()
  weight: number;
}
