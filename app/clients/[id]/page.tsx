"use client"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react"
import { useClientReservations } from "@/hooks/use-client-reservations"
import { useClientPayments } from "@/hooks/use-client-payments"
import { Client } from "@/interfaces/client-table"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Default dates for reservations: del 1 al 31 de julio
const DEFAULT_RESERVATIONS_DATE_FROM = '2025-07-01';
const DEFAULT_RESERVATIONS_DATE_TO = '2025-07-31';

// Default dates for payments: del 1 al 31 de julio
const DEFAULT_PAYMENTS_DATE_FROM = '2025-07-01';
const DEFAULT_PAYMENTS_DATE_TO = '2025-07-31';

// Helper function to format date without UTC timezone issues
const formatDateString = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("es-ES");
  }
  
  return new Date(dateString).toLocaleDateString("es-ES");
};

const formatDateTimeString = (dateTimeString: string | null): string => {
  if (!dateTimeString) return '-';
  return new Date(dateTimeString).toLocaleDateString("es-ES");
};

const getClassStatusBadge = (status: string) => {
  switch (status) {
    case "Aceptada":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aceptada</Badge>
    case "Cancelada":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>
    case "Pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getPaymentMethodBadge = (paymentMethod: string) => {
  switch (paymentMethod) {
    case "credit_card":
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Tarjeta Crédito</Badge>
    case "debit_card":
      return <Badge variant="outline" className="text-green-600 border-green-200">Tarjeta Débito</Badge>
    case "MercadoPago":
      return <Badge variant="outline" className="text-blue-600 border-blue-200">MercadoPago</Badge>
    default:
      return <Badge variant="outline">{paymentMethod}</Badge>
  }
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  // Reservations state
  const [reservationsDateFrom, setReservationsDateFrom] = useState(DEFAULT_RESERVATIONS_DATE_FROM)
  const [reservationsDateTo, setReservationsDateTo] = useState(DEFAULT_RESERVATIONS_DATE_TO)
  const [hasAppliedReservationsFilters, setHasAppliedReservationsFilters] = useState(false)

  // Payments state
  const [paymentsDateFrom, setPaymentsDateFrom] = useState(DEFAULT_PAYMENTS_DATE_FROM)
  const [paymentsDateTo, setPaymentsDateTo] = useState(DEFAULT_PAYMENTS_DATE_TO)
  const [hasAppliedPaymentsFilters, setHasAppliedPaymentsFilters] = useState(false)

  const {
    reservationsResponse,
    visibleReservations,
    startIndex: reservationsStartIndex,
    totalDisplay: reservationsTotalDisplay,
    itemsPerPage: reservationsItemsPerPage,
    getClientReservations,
    goFirst: reservationsGoFirst,
    goPrev: reservationsGoPrev,
    goNext: reservationsGoNext,
    goLast: reservationsGoLast,
  } = useClientReservations(clientId)

  const {
    paymentsResponse,
    visiblePayments,
    startIndex: paymentsStartIndex,
    totalDisplay: paymentsTotalDisplay,
    itemsPerPage: paymentsItemsPerPage,
    getClientPayments,
    goFirst: paymentsGoFirst,
    goPrev: paymentsGoPrev,
    goNext: paymentsGoNext,
    goLast: paymentsGoLast,
  } = useClientPayments(clientId)

  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        if (!token) throw new Error("No hay token, inicia sesión");

        // Fetch clients to find the one with matching ID
        const url = new URL(`${API_BASE_URL}/reports/clients`);
        url.searchParams.set('from', DEFAULT_RESERVATIONS_DATE_FROM);
        url.searchParams.set('to', DEFAULT_RESERVATIONS_DATE_TO);
        url.searchParams.set('page', '0');
        url.searchParams.set('size', '1000'); // Get a large number to find the client
        
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) throw new Error("Error al obtener cliente");
        const data = await res.json();
        
        const foundClient = data.data.find((c: Client) => c.clientInfo.clientId.toString() === clientId);
        if (foundClient) {
          setClient(foundClient);
        }
        setLoading(false);
      } catch (err: any) {
        console.log(err.message);
        setLoading(false);
      }
    };

    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  // Load reservations on mount
  useEffect(() => {
    if (clientId) {
      const rafId = requestAnimationFrame(() => {
        getClientReservations(DEFAULT_RESERVATIONS_DATE_FROM, DEFAULT_RESERVATIONS_DATE_TO, 0, reservationsItemsPerPage);
      });
      return () => cancelAnimationFrame(rafId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Load payments on mount
  useEffect(() => {
    if (clientId) {
      const rafId = requestAnimationFrame(() => {
        getClientPayments(DEFAULT_PAYMENTS_DATE_FROM, DEFAULT_PAYMENTS_DATE_TO, 0, paymentsItemsPerPage);
      });
      return () => cancelAnimationFrame(rafId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const handleReservationsSearch = () => {
    const from = reservationsDateFrom || DEFAULT_RESERVATIONS_DATE_FROM;
    const to = reservationsDateTo || DEFAULT_RESERVATIONS_DATE_TO;
    const hasFilters = reservationsDateFrom !== DEFAULT_RESERVATIONS_DATE_FROM || reservationsDateTo !== DEFAULT_RESERVATIONS_DATE_TO;
    setHasAppliedReservationsFilters(hasFilters);
    getClientReservations(from, to, 0, reservationsItemsPerPage);
  }

  const handleReservationsClear = () => {
    setReservationsDateFrom(DEFAULT_RESERVATIONS_DATE_FROM);
    setReservationsDateTo(DEFAULT_RESERVATIONS_DATE_TO);
    setHasAppliedReservationsFilters(false);
    getClientReservations(DEFAULT_RESERVATIONS_DATE_FROM, DEFAULT_RESERVATIONS_DATE_TO, 0, reservationsItemsPerPage);
  }

  const handlePaymentsSearch = () => {
    const from = paymentsDateFrom || DEFAULT_PAYMENTS_DATE_FROM;
    const to = paymentsDateTo || DEFAULT_PAYMENTS_DATE_TO;
    const hasFilters = paymentsDateFrom !== DEFAULT_PAYMENTS_DATE_FROM || paymentsDateTo !== DEFAULT_PAYMENTS_DATE_TO;
    setHasAppliedPaymentsFilters(hasFilters);
    getClientPayments(from, to, 0, paymentsItemsPerPage);
  }

  const handlePaymentsClear = () => {
    setPaymentsDateFrom(DEFAULT_PAYMENTS_DATE_FROM);
    setPaymentsDateTo(DEFAULT_PAYMENTS_DATE_TO);
    setHasAppliedPaymentsFilters(false);
    getClientPayments(DEFAULT_PAYMENTS_DATE_FROM, DEFAULT_PAYMENTS_DATE_TO, 0, paymentsItemsPerPage);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente no encontrado</h2>
          <p className="text-gray-600 mb-4">El cliente que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => router.push("/clients")}>Volver a Clientes</Button>
        </div>
      </div>
    )
  }

  const clientName = client.clientInfo.clientName || client.clientInfo.clientEmail.split('@')[0];
  const initials = clientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const reservationsEndIndex = Math.max(reservationsStartIndex - 1 + (visibleReservations.length), 0);
  const paymentsEndIndex = Math.max(paymentsStartIndex - 1 + (visiblePayments.length), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Perfil del Cliente</h2>
            <p className="text-gray-600 mt-1">Información detallada y historial</p>
          </div>
        </div>
      </div>

      {/* Client Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{clientName}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  {client.clientInfo.clientEmail}
                </div>
                {client.clientInfo.clientPhone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {client.clientInfo.clientPhone}
                  </div>
                )}
                {client.lastReservationDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Última reserva: {formatDateString(client.lastReservationDate)}
                  </div>
                )}
                {client.lastPaymentDate && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    Último pago: {formatDateString(client.lastPaymentDate)}
                  </div>
                )}
                {client.topDiscipline && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    Disciplina favorita: {client.topDiscipline}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="classes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classes">Historial de Clases</TabsTrigger>
          <TabsTrigger value="purchases">Compras</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Clases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  type="date"
                  value={reservationsDateFrom}
                  onChange={(e) => setReservationsDateFrom(e.target.value)}
                  placeholder="Desde"
                  className="w-full sm:w-40"
                />
                <Input
                  type="date"
                  value={reservationsDateTo}
                  onChange={(e) => setReservationsDateTo(e.target.value)}
                  placeholder="Hasta"
                  className="w-full sm:w-40"
                />
                <Button onClick={handleReservationsSearch} className="w-full sm:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                {hasAppliedReservationsFilters && (
                  <Button onClick={handleReservationsClear} variant="outline" className="w-full sm:w-auto">
                    <X className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Disciplina</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Estudio</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Método de Pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleReservations.map((reservation) => (
                      <TableRow key={reservation.reservationId}>
                        <TableCell>{formatDateString(reservation.reservationDate)}</TableCell>
                        <TableCell>{reservation.reservationTime}</TableCell>
                        <TableCell className="font-medium">{reservation.disciplineName}</TableCell>
                        <TableCell>{reservation.instructorName}</TableCell>
                        <TableCell>{reservation.locationInfo.studioName}</TableCell>
                        <TableCell>{reservation.locationInfo.city}</TableCell>
                        <TableCell>{getClassStatusBadge(reservation.status)}</TableCell>
                        <TableCell>{getPaymentMethodBadge(reservation.paymentMethod)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {visibleReservations.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay reservaciones disponibles.</p>
                </div>
              )}

              {visibleReservations.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Mostrando {reservationsStartIndex} a {reservationsEndIndex} de {reservationsTotalDisplay} reservaciones
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={reservationsGoFirst}
                      disabled={(reservationsResponse?.page ?? 0) === 0}
                      title="Primera página"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={reservationsGoPrev}
                      disabled={(reservationsResponse?.page ?? 0) === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={reservationsGoNext}
                      disabled={(reservationsResponse?.page ?? 0) + 1 >= (reservationsResponse?.totalPages ?? 1)}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={reservationsGoLast}
                      disabled={(reservationsResponse?.page ?? 0) + 1 >= (reservationsResponse?.totalPages ?? 1)}
                      title="Última página"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Compras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Input
                  type="date"
                  value={paymentsDateFrom}
                  onChange={(e) => setPaymentsDateFrom(e.target.value)}
                  placeholder="Desde"
                  className="w-full sm:w-40"
                />
                <Input
                  type="date"
                  value={paymentsDateTo}
                  onChange={(e) => setPaymentsDateTo(e.target.value)}
                  placeholder="Hasta"
                  className="w-full sm:w-40"
                />
                <Button onClick={handlePaymentsSearch} className="w-full sm:w-auto">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                {hasAppliedPaymentsFilters && (
                  <Button onClick={handlePaymentsClear} variant="outline" className="w-full sm:w-auto">
                    <X className="w-4 h-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operación</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Fechas</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Comisiones</TableHead>
                      <TableHead>Neto</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Cuotas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiblePayments.map((payment) => (
                      <TableRow key={payment.operationId}>
                        <TableCell>
                          <div className="font-mono text-sm">{payment.operationId}</div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.packageName}</div>
                            <div className="text-sm text-gray-500">Clases: {payment.classCount}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">
                              <span className="font-medium">Compra:</span>{" "}
                              {formatDateTimeString(payment.purchaseDate)}
                            </div>
                            {payment.accreditationDate && (
                              <div className="text-sm text-green-600">
                                <span className="font-medium">Acreditado:</span>{" "}
                                {formatDateTimeString(payment.accreditationDate)}
                              </div>
                            )}
                            {payment.releaseDate && (
                              <div className="text-sm text-blue-600">
                                <span className="font-medium">Liberado:</span>{" "}
                                {formatDateTimeString(payment.releaseDate)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">S/ {(payment.productValue ?? 0).toFixed(2)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-red-600">-S/ {(payment.transactionFee ?? 0).toFixed(2)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-700">S/ {(payment.amountReceived ?? 0).toFixed(2)}</div>
                        </TableCell>
                        <TableCell>{getPaymentMethodBadge(payment.paymentMethod || '')}</TableCell>
                        <TableCell>
                          {payment.installments && payment.installments > 1 ? `${payment.installments} cuotas` : '1 cuota'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {visiblePayments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay compras disponibles.</p>
                </div>
              )}

              {visiblePayments.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Mostrando {paymentsStartIndex} a {paymentsEndIndex} de {paymentsTotalDisplay} compras
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={paymentsGoFirst}
                      disabled={(paymentsResponse?.page ?? 0) === 0}
                      title="Primera página"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={paymentsGoPrev}
                      disabled={(paymentsResponse?.page ?? 0) === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={paymentsGoNext}
                      disabled={(paymentsResponse?.page ?? 0) + 1 >= (paymentsResponse?.totalPages ?? 1)}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={paymentsGoLast}
                      disabled={(paymentsResponse?.page ?? 0) + 1 >= (paymentsResponse?.totalPages ?? 1)}
                      title="Última página"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
