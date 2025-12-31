import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { BankAliasUseCase } from '../../application/use-cases/bank-alias.use-case';
import { CreateBankAliasDto, UpdateBankAliasDto } from '../../application/ports/input/bank-alias.port';

@ApiTags('Bank Aliases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bank-aliases')
export class BankAliasController {
  constructor(private readonly bankAliasUseCase: BankAliasUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Obtener mis alias bancarios' })
  async getMyAliases(@Request() req: any) {
    return this.bankAliasUseCase.getUserAliases(req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener alias bancarios de otro usuario' })
  async getUserAliases(@Param('userId') userId: string) {
    return this.bankAliasUseCase.getAliasesByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo alias bancario' })
  async createAlias(@Request() req: any, @Body() dto: CreateBankAliasDto) {
    return this.bankAliasUseCase.createAlias(req.user.id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un alias bancario' })
  async updateAlias(
    @Request() req: any,
    @Param('id') aliasId: string,
    @Body() dto: UpdateBankAliasDto,
  ) {
    return this.bankAliasUseCase.updateAlias(req.user.id, aliasId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un alias bancario' })
  async deleteAlias(@Request() req: any, @Param('id') aliasId: string) {
    await this.bankAliasUseCase.deleteAlias(req.user.id, aliasId);
    return { message: 'Alias eliminado correctamente' };
  }
}

