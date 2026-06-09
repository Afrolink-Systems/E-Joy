export type FabricTokenResponse = {
  token?: string;
  access_token?: string;
  effectiveDate?: string;
  expirationDate?: string;
  result?: { token?: string; expirationDate?: string };
  data?: { token?: string; expirationDate?: string };
  code?: string;
  msg?: string;
  errorMsg?: string;
};

export type TelebirrSignedRequest = {
  timestamp: string;
  nonce_str: string;
  method: string;
  version: '1.0';
  sign_type: 'SHA256WithRSA';
  sign: string;
  biz_content: Record<string, string>;
};

export type TelebirrPreOrderResponse = {
  result?: string;
  code?: string;
  msg?: string;
  nonce_str?: string;
  sign?: string;
  sign_type?: string;
  biz_content?: {
    prepay_id?: string;
    merch_order_id?: string;
  };
};

export type TelebirrQueryOrderResponse = {
  result?: string;
  code?: string;
  msg?: string;
  nonce_str?: string;
  sign?: string;
  sign_type?: string;
  biz_content?: {
    merch_order_id?: string;
    order_status?: string;
    trade_status?: string;
    payment_order_id?: string;
    trans_time?: string;
    trans_currency?: string;
    total_amount?: string;
    trans_id?: string;
  };
};

export type TelebirrNotifyPayload = {
  notify_url?: string;
  appid?: string;
  notify_time?: string;
  merch_code?: string;
  merch_order_id: string;
  payment_order_id: string;
  total_amount?: string;
  trans_currency?: string;
  trade_status: string;
  trans_end_time?: string;
  callback_info?: string;
  sign: string;
  sign_type: string;
};

export type TelebirrCheckoutResult = {
  prepayId: string;
  merchOrderId: string;
  rawRequest: string;
  toPayUrl: string;
};
