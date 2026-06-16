import {
  ForbiddenException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Response } from 'express';
import {
  clearRefreshCookie,
  readCookie,
  setRefreshCookie,
} from '../auth/cookie.util';
import { getAuthConfig } from '../auth/auth-config';
import { AuthSessionService } from '../auth/auth-session.service';
import { CurrentUserId } from '../auth/current-user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderHistoryOrderModel } from '../order/order.types';
import {
  CustomerExpenseRangeInput,
  FinishCustomerPasskeyInput,
  RequestCustomerOtpInput,
  VerifyCustomerOtpInput,
} from './customer-auth.inputs';
import { CustomerAuthService } from './customer-auth.service';
import {
  CustomerAuthPayloadModel,
  CustomerExpenseSummaryModel,
  CustomerMeModel,
  CustomerOtpRequestModel,
  CustomerPasskeyOptionsModel,
} from './customer-auth.types';

type GraphqlHttpContext = {
  req?: {
    headers?: Record<string, string | string[] | undefined>;
    ip?: string;
    user?: { subjectType?: string };
  };
  res?: Response;
};

@Resolver()
export class CustomerAuthResolver {
  constructor(
    private readonly customerAuth: CustomerAuthService,
    private readonly authSessions: AuthSessionService,
  ) {}

  @Mutation(() => CustomerOtpRequestModel)
  async requestCustomerOtp(
    @Args('input') input: RequestCustomerOtpInput,
    @Context() ctx: GraphqlHttpContext,
  ): Promise<CustomerOtpRequestModel> {
    const result = await this.customerAuth.requestOtp({
      phone: input.phone,
      purpose: input.purpose,
      ip: this.customerAuthIp(ctx),
    });
    return { ok: true, ...result };
  }

  @Mutation(() => CustomerAuthPayloadModel)
  async verifyCustomerOtp(
    @Args('input') input: VerifyCustomerOtpInput,
    @Context() ctx: GraphqlHttpContext,
  ): Promise<CustomerAuthPayloadModel> {
    const user = await this.customerAuth.verifyOtp({
      phone: input.phone,
      purpose: input.purpose,
      code: input.code,
      ip: this.customerAuthIp(ctx),
    });
    return this.issuePayload(user, ctx);
  }

  @Mutation(() => CustomerPasskeyOptionsModel)
  async beginCustomerPasskeyRegistration(
    @Args('phone') phone: string,
  ): Promise<CustomerPasskeyOptionsModel> {
    return {
      optionsJson: await this.customerAuth.beginPasskeyRegistration(phone),
    };
  }

  @Mutation(() => CustomerAuthPayloadModel)
  async finishCustomerPasskeyRegistration(
    @Args('input') input: FinishCustomerPasskeyInput,
    @Context() ctx: GraphqlHttpContext,
  ): Promise<CustomerAuthPayloadModel> {
    const user = await this.customerAuth.finishPasskeyRegistration(input);
    return this.issuePayload(user, ctx);
  }

  @Mutation(() => CustomerPasskeyOptionsModel)
  async beginCustomerPasskeyLogin(
    @Args('phone') phone: string,
  ): Promise<CustomerPasskeyOptionsModel> {
    return {
      optionsJson: await this.customerAuth.beginPasskeyLogin(phone),
    };
  }

  @Mutation(() => CustomerAuthPayloadModel)
  async finishCustomerPasskeyLogin(
    @Args('input') input: FinishCustomerPasskeyInput,
    @Context() ctx: GraphqlHttpContext,
  ): Promise<CustomerAuthPayloadModel> {
    const user = await this.customerAuth.finishPasskeyLogin(input);
    return this.issuePayload(user, ctx);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => CustomerMeModel, { nullable: true })
  async customerMe(
    @CurrentUserId() userId: string | undefined,
    @Context() ctx: GraphqlHttpContext,
  ): Promise<CustomerMeModel | null> {
    this.assertCustomer(ctx);
    if (!userId) throw new UnauthorizedException('Login required');
    return this.customerAuth.activeCustomer(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async customerLogout(@Context() ctx: GraphqlHttpContext): Promise<boolean> {
    this.assertCustomer(ctx);
    const refreshToken = readCookie(ctx.req, getAuthConfig().refreshCookieName);
    const sessionId = refreshToken
      ? this.authSessions.parseSessionId(refreshToken)
      : undefined;
    if (sessionId) {
      await this.authSessions.revokeSession(sessionId, 'customer_logout');
    }
    clearRefreshCookie(ctx.res);
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Int)
  async claimCustomerOrders(
    @Args('orderIds', { type: () => [String] }) orderIds: string[],
    @CurrentUserId() userId: string | undefined,
    @Context() ctx: GraphqlHttpContext,
  ): Promise<number> {
    this.assertCustomer(ctx);
    if (!userId) throw new UnauthorizedException('Login required');
    return this.customerAuth.claimCustomerOrders(userId, orderIds);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [OrderHistoryOrderModel])
  async customerOrders(
    @CurrentUserId() userId: string | undefined,
    @Context() ctx: GraphqlHttpContext,
  ): Promise<OrderHistoryOrderModel[]> {
    this.assertCustomer(ctx);
    if (!userId) throw new UnauthorizedException('Login required');
    return this.customerAuth.customerOrders(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => CustomerExpenseSummaryModel)
  async customerExpenseSummary(
    @Args('range', { type: () => CustomerExpenseRangeInput, nullable: true })
    range: CustomerExpenseRangeInput | undefined,
    @CurrentUserId() userId: string | undefined,
    @Context() ctx: GraphqlHttpContext,
  ): Promise<CustomerExpenseSummaryModel> {
    this.assertCustomer(ctx);
    if (!userId) throw new UnauthorizedException('Login required');
    return this.customerAuth.expenseSummary(userId, range);
  }

  private async issuePayload(
    user: { id: string },
    ctx: GraphqlHttpContext,
  ): Promise<CustomerAuthPayloadModel> {
    const auth = await this.customerAuth.issueCustomerAuth({ id: user.id });
    setRefreshCookie(ctx.res, auth.refreshToken);
    return {
      accessToken: auth.accessToken,
      expiresAt: auth.expiresAt,
      role: 'customer',
      scope: ['customer:read', 'customer:write', 'order:read'],
    };
  }

  private assertCustomer(ctx: GraphqlHttpContext): void {
    if (ctx.req?.user?.subjectType !== 'CUSTOMER') {
      throw new ForbiddenException('Customer account required');
    }
  }

  private customerAuthIp(ctx: GraphqlHttpContext): string {
    return this.customerAuth.clientIp(ctx.req);
  }
}
