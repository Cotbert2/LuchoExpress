import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageType } from '../enums/message-type.enum';
import { PersonalShopper } from './personal-shopper.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @Column({ type: 'uuid', name: 'customer_id' })
  customerId: string;

  @Column({ type: 'uuid', name: 'personal_shopper_id' })
  personalShopperId: string;

  @ManyToOne(() => PersonalShopper, (shopper) => shopper.messages)
  @JoinColumn({ name: 'personal_shopper_id' })
  personalShopper: PersonalShopper;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @Column({ type: 'varchar', length: 50, name: 'sender_type' })
  senderType: string; // 'CUSTOMER' or 'PERSONAL_SHOPPER'

  @Column({ type: 'boolean', default: false, name: 'is_read' })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
