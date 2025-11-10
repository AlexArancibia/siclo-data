export interface ClientReservationsResponse {
  data: ClientReservation[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ClientReservation {
  reservationId: number;
  classId: number;
  reservationDate: string;
  reservationTime: string;
  orderCreator: string;
  paymentMethod: string;
  status: string;
  clientInfo: ClientReservationInfo;
  locationInfo: LocationInfo;
  disciplineName: string;
  instructorName: string;
}

export interface ClientReservationInfo {
  name: string | null;
  email: string;
  phone: string;
}

export interface LocationInfo {
  studioName: string;
  roomName: string;
  country: string;
  city: string;
}

