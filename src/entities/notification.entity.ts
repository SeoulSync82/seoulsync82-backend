import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notification' })
export class NotificationEntity {
  @Column({ type: 'integer' })
  @Generated('increment')
  id: number;

  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column()
  user_uuid: string;

  @Column()
  target_uuid: string;

  @Column()
  target_user_uuid: string;

  @Column()
  content: string;

  @Column()
  read_at: Date;

  @Column('datetime', {
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
