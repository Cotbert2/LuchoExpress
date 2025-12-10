import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PersonalShopperService } from '../../application/services/personal-shopper.service';
import { PersonalShopperAssignmentService } from '../../application/services/personal-shopper-assignment.service';
import {
  CreatePersonalShopperDto,
  UpdatePersonalShopperDto,
  PersonalShopperResponseDto,
} from '../../application/dtos/personal-shopper.dto';
import { ReassignPersonalShopperDto } from '../../application/dtos/reassign-personal-shopper.dto';
import { UnassignPersonalShopperDto } from '../../application/dtos/order-assignment.dto';

@Controller('api/personal-shoppers')
export class PersonalShopperController {
  constructor(
    private readonly personalShopperService: PersonalShopperService,
    private readonly assignmentService: PersonalShopperAssignmentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreatePersonalShopperDto,
  ): Promise<PersonalShopperResponseDto> {
    return await this.personalShopperService.create(createDto);
  }

  @Get()
  async findAll(): Promise<PersonalShopperResponseDto[]> {
    return await this.personalShopperService.findAll();
  }

  @Get('available')
  async findAvailable(): Promise<PersonalShopperResponseDto[]> {
    return await this.personalShopperService.findAvailable();
  }

  @Get('available/assign')
  async assignAvailablePersonalShopper(): Promise<PersonalShopperResponseDto> {
    return await this.assignmentService.assignAvailablePersonalShopper();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PersonalShopperResponseDto> {
    return await this.personalShopperService.findById(id);
  }

  @Get('by-user/:userId')
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<PersonalShopperResponseDto> {
    return await this.personalShopperService.findByUserId(userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePersonalShopperDto,
  ): Promise<PersonalShopperResponseDto> {
    return await this.personalShopperService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string): Promise<void> {
    await this.personalShopperService.delete(id);
  }

  @Post(':id/assign-order')
  @HttpCode(HttpStatus.OK)
  async assignToOrder(@Param('id') id: string): Promise<{ message: string }> {
    await this.personalShopperService.assignToOrder(id);
    return { message: 'Personal shopper assigned to order successfully' };
  }

  @Post(':id/unassign-order')
  @HttpCode(HttpStatus.OK)
  async unassignFromOrder(
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.personalShopperService.unassignFromOrder(id);
    return { message: 'Personal shopper unassigned from order successfully' };
  }

  @Post('reassign')
  @HttpCode(HttpStatus.OK)
  async reassignPersonalShopper(
    @Body() reassignDto: ReassignPersonalShopperDto,
  ): Promise<{ message: string; personalShopper: PersonalShopperResponseDto }> {
    const personalShopper = await this.assignmentService.reassignPersonalShopper(
      reassignDto.orderId,
      reassignDto.newPersonalShopperId,
    );
    return {
      message: 'Personal shopper reassigned successfully',
      personalShopper,
    };
  }

  @Post('unassign-from-order')
  @HttpCode(HttpStatus.OK)
  async unassignPersonalShopperFromOrder(
    @Body() unassignDto: UnassignPersonalShopperDto,
  ): Promise<{ message: string }> {
    await this.assignmentService.unassignPersonalShopperFromOrder(
      unassignDto.personalShopperId,
      unassignDto.orderId,
    );
    return {
      message: 'Personal shopper unassigned from order successfully',
    };
  }
}
