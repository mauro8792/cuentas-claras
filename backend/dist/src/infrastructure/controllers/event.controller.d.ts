import { EventUseCase } from '../../application/use-cases/event.use-case';
import { EventType } from '../../domain/entities/event.entity';
import { EventsGateway } from '../gateways/events.gateway';
export declare class CreateEventDto {
    name: string;
    type: EventType;
    date: string;
    giftRecipientId?: string;
    giftRecipientGuestId?: string;
}
export declare class UpdateEventDto {
    name?: string;
    date?: string;
}
export declare class AddWishListItemDto {
    description: string;
    url?: string;
}
export declare class EventController {
    private readonly eventUseCase;
    private readonly eventsGateway;
    constructor(eventUseCase: EventUseCase, eventsGateway: EventsGateway);
    create(req: any, groupId: string, dto: CreateEventDto): Promise<import("../../domain/entities/event.entity").Event>;
    findByGroup(req: any, groupId: string): Promise<import("../../domain/entities/event.entity").Event[]>;
    findById(req: any, id: string): Promise<import("../../domain/entities/event.entity").Event>;
    update(req: any, id: string, dto: UpdateEventDto): Promise<import("../../domain/entities/event.entity").Event>;
    settle(req: any, id: string): Promise<import("../../domain/entities/event.entity").Event>;
    delete(req: any, id: string): Promise<void>;
    addWishListItem(req: any, id: string, dto: AddWishListItemDto): Promise<import("../../domain/entities/event.entity").WishListItem>;
    markPurchased(req: any, itemId: string): Promise<import("../../domain/entities/event.entity").WishListItem>;
    removeWishListItem(req: any, itemId: string): Promise<void>;
}
