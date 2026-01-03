import { User } from '../../../domain/entities/user.entity';
export interface RegisterDto {
    email: string;
    password: string;
    name: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface AuthResponse {
    user: Omit<User, 'password' | 'toPublic'>;
    accessToken: string;
    refreshToken: string;
}
export interface IAuthInputPort {
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<void>;
}
