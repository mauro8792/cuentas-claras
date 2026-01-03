import { NotificationService } from '../services/notification.service';
declare class SaveTokenDto {
    token: string;
    device?: string;
}
declare class RemoveTokenDto {
    token: string;
}
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    saveToken(req: any, dto: SaveTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
    removeToken(dto: RemoveTokenDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
