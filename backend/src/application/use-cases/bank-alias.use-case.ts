import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IBankAliasUseCase, CreateBankAliasDto, UpdateBankAliasDto } from '../ports/input/bank-alias.port';
import { IBankAliasRepository, BANK_ALIAS_REPOSITORY } from '../ports/output/bank-alias.repository.port';
import { BankAlias } from '../../domain/entities/bank-alias.entity';

@Injectable()
export class BankAliasUseCase implements IBankAliasUseCase {
  constructor(
    @Inject(BANK_ALIAS_REPOSITORY)
    private bankAliasRepository: IBankAliasRepository,
  ) {}

  async getUserAliases(userId: string): Promise<BankAlias[]> {
    return this.bankAliasRepository.findByUserId(userId);
  }

  async createAlias(userId: string, dto: CreateBankAliasDto): Promise<BankAlias> {
    // Validar prioridad
    if (dto.priority < 1 || dto.priority > 3) {
      throw new BadRequestException('La prioridad debe ser 1, 2 o 3');
    }

    // Verificar si ya existe un alias con esa prioridad
    const existingAliases = await this.bankAliasRepository.findByUserId(userId);
    
    if (existingAliases.length >= 3) {
      throw new BadRequestException('Solo podés tener hasta 3 alias bancarios');
    }

    const existingPriority = existingAliases.find(a => a.priority === dto.priority);
    if (existingPriority) {
      throw new BadRequestException(`Ya tenés un alias con prioridad ${dto.priority}`);
    }

    return this.bankAliasRepository.create(userId, dto.alias, dto.bankName, dto.priority);
  }

  async updateAlias(userId: string, aliasId: string, dto: UpdateBankAliasDto): Promise<BankAlias> {
    const alias = await this.bankAliasRepository.findById(aliasId);
    
    if (!alias) {
      throw new NotFoundException('Alias no encontrado');
    }

    if (alias.userId !== userId) {
      throw new ForbiddenException('No podés editar este alias');
    }

    // Si cambia la prioridad, verificar que no exista otro con esa prioridad
    if (dto.priority && dto.priority !== alias.priority) {
      if (dto.priority < 1 || dto.priority > 3) {
        throw new BadRequestException('La prioridad debe ser 1, 2 o 3');
      }
      const existingPriority = await this.bankAliasRepository.findByUserIdAndPriority(userId, dto.priority);
      if (existingPriority) {
        throw new BadRequestException(`Ya tenés un alias con prioridad ${dto.priority}`);
      }
    }

    return this.bankAliasRepository.update(aliasId, dto);
  }

  async deleteAlias(userId: string, aliasId: string): Promise<void> {
    const alias = await this.bankAliasRepository.findById(aliasId);
    
    if (!alias) {
      throw new NotFoundException('Alias no encontrado');
    }

    if (alias.userId !== userId) {
      throw new ForbiddenException('No podés eliminar este alias');
    }

    await this.bankAliasRepository.delete(aliasId);
  }

  async getAliasesByUserId(userId: string): Promise<BankAlias[]> {
    return this.bankAliasRepository.findByUserId(userId);
  }
}

