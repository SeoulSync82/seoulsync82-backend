import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "course" })
export class CourseEntity{

@PrimaryGeneratedColumn()
id: number;

@Column()
uuid: string;

@Column()
count: number;

@Column()
image: string;

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