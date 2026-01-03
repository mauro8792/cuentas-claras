"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = exports.GroupMember = void 0;
class GroupMember {
    constructor(props) {
        this.id = props.id;
        this.userId = props.userId;
        this.user = props.user;
        this.groupId = props.groupId;
        this.joinedAt = props.joinedAt;
    }
}
exports.GroupMember = GroupMember;
class Group {
    constructor(props) {
        this.id = props.id;
        this.name = props.name;
        this.inviteCode = props.inviteCode;
        this.createdById = props.createdById;
        this.createdBy = props.createdBy;
        this.members = props.members;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    isMember(userId) {
        return this.members?.some((m) => m.userId === userId) ?? false;
    }
    isCreator(userId) {
        return this.createdById === userId;
    }
}
exports.Group = Group;
//# sourceMappingURL=group.entity.js.map