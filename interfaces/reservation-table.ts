export interface ReservationTable {
  summary: ReservationSummary;
  data: Reservation[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Reservation {
  reservationId: number;
  classId: number;
  reservationDate: string;
  reservationTime: string;
  orderCreator: string;
  paymentMethod: string;
  status: string;
  clientInfo: ClientInfo;
  locationInfo: LocationInfo;
  disciplineName: string;
  instructorName: string;
}

export interface ClientInfo {
  name: string | null;
  email: string;
  phone: string | null;
}

export interface LocationInfo {
  studioName: string;
  roomName: string;
  country: string;
  city: string;
}

export interface ReservationSummary {
  accepted: number;
  pending: number;
  cancelled: number;
  totalClasses: number;
}



