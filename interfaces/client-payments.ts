export interface ClientPaymentsResponse {
  data: ClientPayment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ClientPayment {
  operationId: number;
  month: number;
  day: number;
  week: number;
  purchaseDate: string;
  accreditationDate: string;
  releaseDate: string;
  operationType: string;
  productValue: number;
  transactionFee: number;
  amountReceived: number;
  installments: number;
  paymentMethod: string;
  packageName: string;
  classCount: number;
  clientInfo: ClientPaymentInfo;
}

export interface ClientPaymentInfo {
  name: string | null;
  email: string;
  phone: string;
}

