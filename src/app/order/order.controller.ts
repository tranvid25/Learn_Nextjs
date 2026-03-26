import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderUseCase } from './usecase/order.usecase';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ApiResponse } from 'src/common/base/api-response';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { Public } from 'src/common/decorators/public.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderUseCase: OrderUseCase) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() currentUser: any,
  ) {
    if (currentUser?.id && !createOrderDto.userId) {
      createOrderDto.userId = currentUser.id;
    }
    const data = await this.orderUseCase.createOrder(createOrderDto);
    return ApiResponse.ok(data, 'Order created successfully');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Get all orders (Admin only)' })
  async findAll() {
    const data = await this.orderUseCase.getAllOrders();
    return ApiResponse.ok(data, 'Orders retrieved successfully');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.orderUseCase.getOrderById(id);
    return ApiResponse.ok(data, 'Order retrieved successfully');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const data = await this.orderUseCase.updateOrderStatus(id, updateOrderDto);
    return ApiResponse.ok(data, 'Order status updated successfully');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an order (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.orderUseCase.deleteOrder(id);
    return ApiResponse.ok(null, 'Order deleted successfully');
  }
}
