"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUseCase = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
let AuthUseCase = class AuthUseCase {
    constructor(userRepository, tokenRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.userRepository.create({
            email: dto.email.toLowerCase(),
            password: hashedPassword,
            name: dto.name,
        });
        const tokens = await this.generateTokens(user.id);
        return {
            user: user.toPublic(),
            ...tokens,
        };
    }
    async login(dto) {
        const user = await this.userRepository.findByEmail(dto.email.toLowerCase());
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const tokens = await this.generateTokens(user.id);
        return {
            user: user.toPublic(),
            ...tokens,
        };
    }
    async refreshToken(refreshToken) {
        const tokenData = await this.tokenRepository.findRefreshToken(refreshToken);
        if (!tokenData || tokenData.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Token de refresco inválido o expirado');
        }
        await this.tokenRepository.deleteRefreshToken(refreshToken);
        return this.generateTokens(tokenData.userId);
    }
    async logout(userId, refreshToken) {
        await this.tokenRepository.deleteRefreshToken(refreshToken);
    }
    async generateTokens(userId) {
        const payload = { sub: userId };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRATION') || '7d',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '30d',
        });
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        await this.tokenRepository.createRefreshToken(userId, refreshToken, expiresAt);
        return { accessToken, refreshToken };
    }
};
exports.AuthUseCase = AuthUseCase;
exports.AuthUseCase = AuthUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, jwt_1.JwtService,
        config_1.ConfigService])
], AuthUseCase);
//# sourceMappingURL=auth.use-case.js.map