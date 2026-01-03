"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = exports.WishListItem = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["GIFT"] = "GIFT";
    EventType["GATHERING"] = "GATHERING";
})(EventType || (exports.EventType = EventType = {}));
class WishListItem {
    constructor(props) {
        this.id = props.id;
        this.eventId = props.eventId;
        this.description = props.description;
        this.url = props.url;
        this.isPurchased = props.isPurchased;
        this.purchasedById = props.purchasedById;
        this.purchasedBy = props.purchasedBy;
        this.createdAt = props.createdAt;
    }
}
exports.WishListItem = WishListItem;
class Event {
    constructor(props) {
        this.id = props.id;
        this.groupId = props.groupId;
        this.name = props.name;
        this.type = props.type;
        this.date = props.date;
        this.giftRecipientId = props.giftRecipientId;
        this.giftRecipient = props.giftRecipient;
        this.giftRecipientGuestId = props.giftRecipientGuestId;
        this.giftRecipientGuest = props.giftRecipientGuest;
        this.isSettled = props.isSettled;
        this.settledAt = props.settledAt;
        this.wishList = props.wishList;
        this.expenses = props.expenses;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }
    isGiftEvent() {
        return this.type === EventType.GIFT;
    }
    isHiddenFromUser(userId) {
        return this.isGiftEvent() && this.giftRecipientId === userId;
    }
    canBeModified() {
        return !this.isSettled;
    }
    getRecipientName() {
        return this.giftRecipient?.name || this.giftRecipientGuest?.name;
    }
}
exports.Event = Event;
//# sourceMappingURL=event.entity.js.map