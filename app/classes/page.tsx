"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from "lucide-react"
import { useClassesView } from "@/hooks/use-classes-view"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [disciplineFilter, setDisciplineFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

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
      getReservationsTable('2025-07-07', '2025-07-15', 1, itemsPerPage)
    })
    return () => cancelAnimationFrame(rafId)
  }, [])

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
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Clase
        </Button>
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="Desde"
                className="flex-1"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="Hasta"
                className="flex-1"
              />
              <Button onClick={() => {}} className="w-full sm:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
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
                  disabled={(reservationsTable?.page ?? 1) === 1}
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={(reservationsTable?.page ?? 1) === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={(reservationsTable?.page ?? 1) >= (reservationsTable?.totalPages ?? 1)}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goLast}
                  disabled={(reservationsTable?.page ?? 1) >= (reservationsTable?.totalPages ?? 1)}
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
