import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './infrastructure/config/database.config';
import { RabbitMQModule } from './infrastructure/config/rabbitmq.module';

// Entities
import { PersonalShopper } from './domain/entities/personal-shopper.entity';
import { Message } from './domain/entities/message.entity';

// Repositories
import { PersonalShopperRepository } from './infrastructure/persistence/repositories/personal-shopper.repository';
import { MessageRepository } from './infrastructure/persistence/repositories/message.repository';

// Services
import { PersonalShopperService } from './application/services/personal-shopper.service';
import { PersonalShopperAssignmentService } from './application/services/personal-shopper-assignment.service';
import { MessageService } from './application/services/message.service';
import { RabbitMQService } from './application/services/rabbitmq.service';

// Controllers
import { PersonalShopperController } from './presentation/controllers/personal-shopper.controller';
import { MessageController } from './presentation/controllers/message.controller';

// Gateways
import { ChatGateway } from './presentation/gateways/chat.gateway';

// Seeders
import { PersonalShopperSeeder } from './infrastructure/seeders/personal-shopper.seeder';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([PersonalShopper, Message]),
    RabbitMQModule,
  ],
  controllers: [PersonalShopperController, MessageController],
  providers: [
    // Repositories
    {
      provide: 'IPersonalShopperRepository',
      useClass: PersonalShopperRepository,
    },
    {
      provide: 'IMessageRepository',
      useClass: MessageRepository,
    },
    // Services
    PersonalShopperService,
    PersonalShopperAssignmentService,
    MessageService,
    RabbitMQService,
    // Gateways
    ChatGateway,
    // Seeders
    PersonalShopperSeeder,
  ],
})
export class AppModule {}
