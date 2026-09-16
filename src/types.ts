export type MachinePower = 'OFF' | 'BOOTING' | 'ON';

export type PaymentMethod = 'CARD' | 'UPI';

export type MachineScreenState =
  | 'OFF'
  | 'BOOTING'
  | 'WELCOME'
  | 'IDLE_CHOOSE_METHOD'
  | 'AWAITING_CARD_TAP'
  | 'CARD_DETECTED'
  | 'ENTERING_PIN'
  | 'AUTHORIZING'
  | 'AWAITING_UPI_SCAN'
  | 'PAYMENT_SUCCESSFUL'
  | 'RECEIPT_DISPENSING'
  | 'COMPLETE';

export type TerminalMode = 'NORMAL' | 'RETRO_1987' | 'DEVELOPER';

export interface OrderDetails {
  storeName: string;
  orderNo: string;
  amount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentMethodLabel: string;
  status: string;
  date: string;
  time: string;
  dateTimeFull: string;
  transactionId: string;
}
