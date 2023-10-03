import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "place" })
export class PlaceEntity{

@PrimaryGeneratedColumn()
id: number;

@Column()
uuid: string;

@Column()
place_name: string;

@Column()
place_type: string;

@Column()
thumbnail: string;

@Column({ type: 'decimal', precision: 10, scale: 7 })
latitue: number;

@Column({ type: 'decimal', precision: 10, scale: 7 })
longitude: number;

@Column()
address: string;

@Column()
phone_number: string;

@Column()
url: string;

@Column({ type: 'decimal'})
score: number

@Column()
kakao_rating: Boolean;

@Column()
review_count: number;

@Column('datetime', {
  name: 'created_at',
  default: () => 'CURRENT_TIMESTAMP',
})
created_at: Date;

@Column('datetime', {
  name: 'updated_at',
  default: () => 'CURRENT_TIMESTAMP',
})
updated_at: Date;
}