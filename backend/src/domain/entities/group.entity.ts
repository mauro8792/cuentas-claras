import { User } from './user.entity';

export class GroupMember {
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
  }) {
    this.id = props.id;
    this.userId = props.userId;
    this.user = props.user;
    this.groupId = props.groupId;
    this.joinedAt = props.joinedAt;
  }
}

export class Group {
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
  }) {
    this.id = props.id;
    this.name = props.name;
    this.inviteCode = props.inviteCode;
    this.createdById = props.createdById;
    this.createdBy = props.createdBy;
    this.members = props.members;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  isMember(userId: string): boolean {
    return this.members?.some((m) => m.userId === userId) ?? false;
  }

  isCreator(userId: string): boolean {
    return this.createdById === userId;
  }
}

