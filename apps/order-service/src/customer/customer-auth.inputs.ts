import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RequestCustomerOtpInput {
  @Field()
  phone!: string;

  @Field()
  purpose!: string;
}

@InputType()
export class VerifyCustomerOtpInput {
  @Field()
  phone!: string;

  @Field()
  code!: string;

  @Field()
  purpose!: string;
}

@InputType()
export class FinishCustomerPasskeyInput {
  @Field()
  phone!: string;

  @Field()
  responseJson!: string;
}

@InputType()
export class CustomerExpenseRangeInput {
  @Field({ nullable: true })
  from?: string;

  @Field({ nullable: true })
  to?: string;
}
