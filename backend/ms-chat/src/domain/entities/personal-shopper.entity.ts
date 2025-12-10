import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PersonalShopperStatus } from '../enums/personal-shopper-status.enum';
import { Message } from './message.entity';

@Entity('personal_shoppers')
export class PersonalShopper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true, name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: PersonalShopperStatus,
    default: PersonalShopperStatus.AVAILABLE,
  })
  status: PersonalShopperStatus;

  @Column({ type: 'int', default: 0, name: 'active_orders' })
  activeOrders: number;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @OneToMany(() => Message, (message) => message.personalShopper)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
