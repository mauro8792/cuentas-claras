import { AuthUseCase } from '../../application/use-cases/auth.use-case';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthController {
    private readonly authUseCase;
    constructor(authUseCase: AuthUseCase);
    register(dto: RegisterDto): Promise<import("../../application/ports/input/auth.port").AuthResponse>;
    login(dto: LoginDto): Promise<import("../../application/ports/input/auth.port").AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
