import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  IAuthInputPort,
  RegisterDto,
  LoginDto,
  AuthResponse,
} from '../ports/input/auth.port';
import { IUserRepositoryPort } from '../ports/output/user.repository.port';
import { ITokenRepositoryPort } from '../ports/output/token.repository.port';

@Injectable()
export class AuthUseCase implements IAuthInputPort {
  constructor(
    private readonly userRepository: IUserRepositoryPort,
    private readonly tokenRepository: ITokenRepositoryPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Crear usuario
    const user = await this.userRepository.create({
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      name: dto.name,
    });

    // Generar tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: user.toPublic(),
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(user.id);

    return {
      user: user.toPublic(),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenData = await this.tokenRepository.findRefreshToken(refreshToken);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }

    // Eliminar el token usado
    await this.tokenRepository.deleteRefreshToken(refreshToken);

    // Generar nuevos tokens
    return this.generateTokens(tokenData.userId);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.tokenRepository.deleteRefreshToken(refreshToken);
  }

  private async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION') || '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
    });

    // Guardar refresh token en la base de datos
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.tokenRepository.createRefreshToken(userId, refreshToken, expiresAt);

    return { accessToken, refreshToken };
  }
}

