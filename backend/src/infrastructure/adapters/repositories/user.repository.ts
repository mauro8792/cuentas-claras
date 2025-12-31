import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { IUserRepositoryPort } from '../../../application/ports/output/user.repository.port';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { email: string; password: string; name: string }): Promise<User> {
    const user = await this.prisma.user.create({ data });
    return this.toEntity(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? this.toEntity(user) : null;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        avatar: data.avatar,
      },
    });
    return this.toEntity(user);
  }

  private toEntity(data: any): User {
    return new User({
      id: data.id,
      email: data.email,
      password: data.password,
      name: data.name,
      avatar: data.avatar,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}

