import { User } from '../../../domain/entities/user.entity';

export interface IUserRepositoryPort {
  create(data: { email: string; password: string; name: string }): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
}

