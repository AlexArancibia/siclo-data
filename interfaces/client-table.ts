export interface ClientTable {
  summary?: ClientSummary;
  data: Client[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string;
  city: string;
  totalClasses: number;
  totalSpent: number;
  lastVisit: string;
  status: string;
  favoriteClass?: string;
  joinDate?: string;
}

export interface ClientSummary {
  totalClients: number;
  activeClients: number;
  vipClients: number;
  totalRevenue: number;
}

