export class User {
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
  }) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.name = props.name;
    this.avatar = props.avatar;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  toPublic(): Omit<User, 'password' | 'toPublic'> {
    const { password, toPublic, ...publicUser } = this;
    return publicUser;
  }
}

