import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Purse } from './model/purse.model';
import { User } from './model/user.model';
import { UserDto } from './dto/user.dto';
import { PurseDto } from './dto/purse.dto';
import { RemittanceResultDto } from './dto/remittance-result.dto';
import { RemittanceDto } from './dto/remittance.dto';
import { Connection } from 'typeorm';
import { BalanceValueDto } from './dto/balance-value.dto';

@Controller()
@ApiTags('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly connection: Connection,
  ) {
  }

  @Get('users')
  @ApiResponse({
    type: User,
    isArray: true,
  })
  async getUsers(): Promise<User[]> {
    return this.appService.getUsers();
  }

  @Get('users/:userId/purse')
  @ApiResponse({
    type: Purse,
  })
  async getDefaultPurse(@Param('userId') userId: string): Promise<Purse> {
    const userIdNum = Number(userId);
    return await this.appService.getPurse(userIdNum);
  }

  @Post('users')
  @ApiResponse({
    type: User,
  })
  async createUser(@Body() userDto: UserDto) {
    return this.appService.createUser(userDto);
  }

  @Post('users/:userId/purse')
  @ApiResponse({
    type: Purse,
  })
  async createPurseForUser(@Param('userId') userId: string, @Body() purseDto: PurseDto) {
    const userIdNum = Number(userId);
    return await this.appService.createPurse(purseDto, userIdNum);
  }

  @Post('remittance')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittance(@Body() remittanceDto: RemittanceDto) {
    return this.appService.makeRemittance(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum);
  }

  @Post('remittance-with-error')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittanceWithError(@Body() remittanceDto: RemittanceDto) {
    return this.appService.makeRemittance(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum, true);
  }

  @Post('remittance-with-transaction')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittanceWithTransaction(@Body() remittanceDto: RemittanceDto) {
    return await this.connection.transaction(manager => {
      return this.appService.withTransaction(manager).makeRemittance(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum);
    });
  }

  @Post('remittance-with-error-and-transaction')
  @ApiResponse({
    type: RemittanceResultDto,
  })
  async makeRemittanceWithErrorAndTransaction(@Body() remittanceDto: RemittanceDto) {
    return await this.connection.transaction(manager => {
      return this.appService.withTransaction(manager).makeRemittance(remittanceDto.userIdFrom, remittanceDto.userIdTo, remittanceDto.sum, true);
    });
  }

  @Patch('purse/:purseId/top-up')
  @ApiResponse({
    type: Purse,
  })
  async topUpPurse(@Param('purseId') purseId: string, @Body() balanceValue: BalanceValueDto) {
    const purseIdNum = Number(purseId);
    return this.appService.topUpPurse(purseIdNum, balanceValue.sum);
  }
}
