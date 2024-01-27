import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'subway_' })
export class SubwayLineEntity {
  @PrimaryGeneratedColumn()
  line_uuid: string;

  @Column()
  line: string;
}
