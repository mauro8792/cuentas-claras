export class BankAlias {
  id: string;
  userId: string;
  alias: string;
  bankName?: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<BankAlias>) {
    Object.assign(this, partial);
  }
}

