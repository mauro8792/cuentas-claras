import { User } from './user.entity';
export declare class GroupMember {
    readonly id: string;
    readonly userId: string;
    readonly user?: User;
    readonly groupId: string;
    readonly joinedAt: Date;
    constructor(props: {
        id: string;
        userId: string;
        user?: User;
        groupId: string;
        joinedAt: Date;
    });
}
export declare class Group {
    readonly id: string;
    readonly name: string;
    readonly inviteCode: string;
    readonly createdById: string;
    readonly createdBy?: User;
    readonly members?: GroupMember[];
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    constructor(props: {
        id: string;
        name: string;
        inviteCode: string;
        createdById: string;
        createdBy?: User;
        members?: GroupMember[];
        createdAt: Date;
        updatedAt?: Date;
    });
    isMember(userId: string): boolean;
    isCreator(userId: string): boolean;
}
