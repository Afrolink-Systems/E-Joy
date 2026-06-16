import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class RequestCustomerOtpInput {
  @Field()
  @IsString()
  phone!: string;

  @Field()
  @IsString()
  purpose!: string;
}

@InputType()
export class VerifyCustomerOtpInput {
  @Field()
  @IsString()
  phone!: string;

  @Field()
  @IsString()
  code!: string;

  @Field()
  @IsString()
  purpose!: string;
}

@InputType()
export class FinishCustomerPasskeyInput {
  @Field()
  @IsString()
  phone!: string;

  @Field()
  @IsString()
  responseJson!: string;
}

@InputType()
export class CustomerExpenseRangeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  from?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  to?: string;
}
