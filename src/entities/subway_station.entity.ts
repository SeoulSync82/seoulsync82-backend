import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'subway_station' })
export class SubwayStationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  line: string;

  @Column()
  line_uuid: string;
}
