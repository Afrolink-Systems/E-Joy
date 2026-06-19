import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CustomerAuthPayloadModel {
  @Field()
  accessToken!: string;

  @Field()
  expiresAt!: string;

  @Field()
  role!: string;

  @Field(() => [String])
  scope!: string[];
}

@ObjectType()
export class CustomerMeModel {
  @Field()
  id!: string;

  @Field()
  phone!: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field()
  phoneVerified!: boolean;

  @Field(() => Int)
  passkeyCount!: number;
}

@ObjectType()
export class CustomerOtpRequestModel {
  @Field()
  ok!: boolean;

  @Field()
  expiresAt!: string;

  @Field(() => Int, { nullable: true })
  retryAfterSeconds?: number;

  @Field(() => String, { nullable: true })
  devCode?: string;
}

@ObjectType()
export class CustomerOtpVerifyModel {
  @Field()
  ok!: boolean;

  @Field()
  phone!: string;
}

@ObjectType()
export class CustomerPasskeyOptionsModel {
  @Field()
  optionsJson!: string;
}

@ObjectType()
export class CustomerExpenseRestaurantModel {
  @Field()
  shopId!: string;

  @Field()
  shopName!: string;

  @Field(() => Int)
  orderCount!: number;

  @Field(() => Int)
  totalAmount!: number;
}

@ObjectType()
export class CustomerExpenseSummaryModel {
  @Field(() => Int)
  orderCount!: number;

  @Field(() => Int)
  totalAmount!: number;

  @Field(() => [CustomerExpenseRestaurantModel])
  byRestaurant!: CustomerExpenseRestaurantModel[];
}
