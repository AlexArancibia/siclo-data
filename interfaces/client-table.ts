export interface ClientTable {
  data: Client[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Client {
  clientInfo: ClientInfo;
  totalReservations: number;
  totalPayments: number;
  totalAmountReceived: number;
  lastPaymentDate: string | null;
  lastReservationDate: string | null;
  topDiscipline: string | null;
}

export interface ClientInfo {
  clientId: number;
  clientName: string | null;
  clientEmail: string;
  clientPhone: string;
}

export interface ClientSummary {
  totalClients: number;
  activeClients: number;
  vipClients: number;
  totalRevenue: number;
}

