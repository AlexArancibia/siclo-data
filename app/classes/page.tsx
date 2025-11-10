"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  X,
} from "lucide-react"
import { useClassesView } from "@/hooks/use-classes-view"

// Default dates for initial load: del 1 al 31 de julio
const DEFAULT_DATE_FROM = '2025-07-01';
const DEFAULT_DATE_TO = '2025-07-31';

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Aceptada":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aceptada</Badge>
    case "Pendiente":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
    case "Cancelada":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

const getPaymentMethodBadge = (method: string) => {
  switch (method) {
    case "MercadoPago":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          MercadoPago
        </Badge>
      )
    case "Tarjeta":
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Tarjeta
        </Badge>
      )
    case "Efectivo":
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          Efectivo
        </Badge>
      )
    case "Transferencia":
      return (
        <Badge variant="outline" className="text-purple-600 border-purple-200">
          Transferencia
        </Badge>
      )
    case "PayPal":
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          PayPal
        </Badge>
      )
    default:
      return <Badge variant="outline">{method}</Badge>
  }
}

export default function ClassesPage() {
  const [instructorFilter, setInstructorFilter] = useState("")
  const [clientFilter, setClientFilter] = useState("")
  const [dateFrom, setDateFrom] = useState(DEFAULT_DATE_FROM)
  const [dateTo, setDateTo] = useState(DEFAULT_DATE_TO)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false)

  const {
    reservationsTable,
    visibleReservations,
    startIndex,
    totalDisplay,
    currentPage,
    itemsPerPage,
    getReservationsTable,
    goFirst,
    goPrev,
    goNext,
    goLast,
  } = useClassesView();

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      // Use default dates if datepickers are empty
      const from = dateFrom || DEFAULT_DATE_FROM;
      const to = dateTo || DEFAULT_DATE_TO;
      getReservationsTable(from, to, 0, itemsPerPage)
    })
    return () => cancelAnimationFrame(rafId)
  }, [])

  const handleSearch = () => {
    // Apply filters when search button is clicked
    // Use default dates if datepickers are empty
    const from = dateFrom || DEFAULT_DATE_FROM;
    const to = dateTo || DEFAULT_DATE_TO;
    const instructor = instructorFilter.trim() || undefined;
    const client = clientFilter.trim() || undefined;
    
    // Check if any filters are actually being applied (dates different from defaults or other filters)
    const hasFilters = instructor !== undefined || client !== undefined || dateFrom !== DEFAULT_DATE_FROM || dateTo !== DEFAULT_DATE_TO;
    setHasAppliedFilters(hasFilters);
    
    getReservationsTable(from, to, 0, itemsPerPage, instructor, client);
  }

  const handleClear = () => {
    // Clear all filters and reset to initial state
    setInstructorFilter("");
    setClientFilter("");
    setDateFrom(DEFAULT_DATE_FROM);
    setDateTo(DEFAULT_DATE_TO);
    setHasAppliedFilters(false);
    // Reload with default dates and no filters
    getReservationsTable(DEFAULT_DATE_FROM, DEFAULT_DATE_TO, 0, itemsPerPage);
  }

  const endIndex = Math.max(startIndex - 1 + (visibleReservations.length), 0)

  // Calculate stats from API summary
  const totalClasses = reservationsTable?.summary.totalClasses ?? totalDisplay
  const acceptedClasses = reservationsTable?.summary.accepted ?? 0
  const cancelledClasses = reservationsTable?.summary.cancelled ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Clases</h2>
          <p className="text-gray-600 mt-1">Gestiona las reservas y horarios de clases</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clases</p>
                <p className="text-3xl font-bold text-gray-900">{totalClasses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aceptadas</p>
                <p className="text-3xl font-bold text-green-600">{acceptedClasses}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-3xl font-bold text-red-700">{cancelledClasses}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Filtrar por instructor"
                  value={instructorFilter}
                  onChange={(e) => setInstructorFilter(e.target.value)}
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <div className="relative flex-1">
                <Input
                  placeholder="Filtrar por cliente (email)"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
              </div>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Desde"
                className="w-full sm:w-40"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Hasta"
                className="w-full sm:w-40"
              />
              <Button onClick={handleSearch} className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              {hasAppliedFilters && (
                <Button onClick={handleClear} variant="outline" className="w-full sm:w-auto">
                  <X className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Classes Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reserva</TableHead>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleReservations.map((reservation) => (
                  <TableRow key={reservation.reservationId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.reservationId}</div>
                        <div className="text-sm text-gray-500">ID Clase: {reservation.classId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.disciplineName}</div>
                        <div className="text-sm text-gray-500">{reservation.locationInfo?.studioName}</div>
                        <div className="text-sm text-gray-500">{reservation.locationInfo?.roomName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.locationInfo?.city}</div>
                        <div className="text-sm text-gray-500">{reservation.locationInfo?.country}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{reservation.instructorName}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {reservation.reservationDate ? new Date(reservation.reservationDate).toLocaleDateString("es-ES") : '-'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.reservationTime}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.clientInfo?.name}</div>
                        <div className="text-sm text-gray-500">{reservation.clientInfo?.email}</div>
                        <div className="text-sm text-gray-500">Reservado por: {reservation.orderCreator}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPaymentMethodBadge(reservation.paymentMethod)}</TableCell>
                    <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {visibleReservations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay clases disponibles.</p>
            </div>
          )}

          {visibleReservations.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex} a {endIndex} de {totalDisplay} clases
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goFirst}
                  disabled={(reservationsTable?.page ?? 0) === 0}
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={(reservationsTable?.page ?? 0) === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={(reservationsTable?.page ?? 0) + 1 >= (reservationsTable?.totalPages ?? 1)}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goLast}
                  disabled={(reservationsTable?.page ?? 0) + 1 >= (reservationsTable?.totalPages ?? 1)}
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
