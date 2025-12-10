import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PersonalShopper } from '../../domain/entities/personal-shopper.entity';
import { Message } from '../../domain/entities/message.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port:  5434,
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'chat_db',
  entities: [PersonalShopper, Message],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in development only
  logging: process.env.NODE_ENV === 'development',
};
