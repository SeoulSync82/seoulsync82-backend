import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'subway_line' })
export class SubwayLineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  line: string;
}
