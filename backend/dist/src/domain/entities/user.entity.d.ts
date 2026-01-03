export declare class User {
    readonly id: string;
    readonly email: string;
    readonly password: string;
    readonly name: string;
    readonly avatar?: string;
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    constructor(props: {
        id: string;
        email: string;
        password: string;
        name: string;
        avatar?: string;
        createdAt: Date;
        updatedAt?: Date;
    });
    toPublic(): Omit<User, 'password' | 'toPublic'>;
}
