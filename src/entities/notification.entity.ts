import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notification' })
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 32, nullable: false, unique: true })
  uuid: string;

  @Column({ type: 'char', length: 32, nullable: false })
  user_uuid: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  target_type: string;

  @Column({ type: 'char', length: 32, nullable: false })
  target_uuid: string;

  @Column({ type: 'char', length: 32, nullable: false })
  target_user_uuid: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  content: string;

  @Column({ type: 'datetime', nullable: true })
  read_at: Date;

  @CreateDateColumn({
    type: 'datetime',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
