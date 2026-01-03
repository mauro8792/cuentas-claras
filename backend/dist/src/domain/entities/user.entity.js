"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(props) {
        this.id = props.id;
        this.email = props.email;
        this.password = props.password;
        this.name = props.name;
        this.avatar = props.avatar;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    toPublic() {
        const { password, toPublic, ...publicUser } = this;
        return publicUser;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map