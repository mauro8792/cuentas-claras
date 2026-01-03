import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthInputPort, RegisterDto, LoginDto, AuthResponse } from '../ports/input/auth.port';
import { IUserRepositoryPort } from '../ports/output/user.repository.port';
import { ITokenRepositoryPort } from '../ports/output/token.repository.port';
export declare class AuthUseCase implements IAuthInputPort {
    private readonly userRepository;
    private readonly tokenRepository;
    private readonly jwtService;
    private readonly configService;
    constructor(userRepository: IUserRepositoryPort, tokenRepository: ITokenRepositoryPort, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<void>;
    private generateTokens;
}
