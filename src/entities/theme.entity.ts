import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'theme' })
export class ThemeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uuid: string;

  @Column()
  theme_name: string;
}
