import { IEventInputPort, CreateEventDto, AddWishListItemDto } from '../ports/input/event.port';
import { IEventRepositoryPort } from '../ports/output/event.repository.port';
import { IGroupRepositoryPort } from '../ports/output/group.repository.port';
import { Event, WishListItem } from '../../domain/entities/event.entity';
export declare class EventUseCase implements IEventInputPort {
    private readonly eventRepository;
    private readonly groupRepository;
    constructor(eventRepository: IEventRepositoryPort, groupRepository: IGroupRepositoryPort);
    create(userId: string, groupId: string, dto: CreateEventDto): Promise<Event>;
    findById(userId: string, eventId: string): Promise<Event>;
    findByGroupId(userId: string, groupId: string): Promise<Event[]>;
    settle(userId: string, eventId: string): Promise<Event>;
    update(userId: string, eventId: string, dto: {
        name?: string;
        date?: Date;
    }): Promise<Event>;
    delete(userId: string, eventId: string): Promise<void>;
    addWishListItem(userId: string, eventId: string, dto: AddWishListItemDto): Promise<WishListItem>;
    markWishListItemPurchased(userId: string, itemId: string): Promise<WishListItem>;
    removeWishListItem(userId: string, itemId: string): Promise<void>;
}
