"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useClientsView } from "@/hooks/use-clients-view"
import { getDefaultMonthDateRange } from "@/lib/format-date"

const { from: DEFAULT_DATE_FROM, to: DEFAULT_DATE_TO } = getDefaultMonthDateRange();

// Helper function to format date without UTC timezone issues
const formatDateString = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  // Parse the date string directly to avoid UTC timezone issues
  // Format: "YYYY-MM-DD" or "YYYY-M-D"
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    
    // Create date in local timezone to avoid UTC conversion
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("es-ES");
  }
  
  // Fallback to original method if format is unexpected
  return new Date(dateString).toLocaleDateString("es-ES");
};

export default function ClientsPage() {
  const [clientEmail, setClientEmail] = useState("")
  const [dateFrom, setDateFrom] = useState(DEFAULT_DATE_FROM)
  const [dateTo, setDateTo] = useState(DEFAULT_DATE_TO)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false)

  const {
    clientsTable,
    visibleClients,
    startIndex,
    totalDisplay,
    currentPage,
    itemsPerPage,
    getClientsTable,
    goFirst,
    goPrev,
    goNext,
    goLast,
  } = useClientsView();

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      // Use default dates if datepickers are empty
      const from = dateFrom || DEFAULT_DATE_FROM;
      const to = dateTo || DEFAULT_DATE_TO;
      getClientsTable(from, to, 0, itemsPerPage)
    })
    return () => cancelAnimationFrame(rafId)
  }, [])

  const handleSearch = () => {
    // Apply filters when search button is clicked
    // Use default dates if datepickers are empty
    const from = dateFrom || DEFAULT_DATE_FROM;
    const to = dateTo || DEFAULT_DATE_TO;
    const client = clientEmail.trim() || undefined;
    
    // Check if any filters are actually being applied (dates different from defaults or other filters)
    const hasFilters = client !== undefined || dateFrom !== DEFAULT_DATE_FROM || dateTo !== DEFAULT_DATE_TO;
    setHasAppliedFilters(hasFilters);
    
    getClientsTable(from, to, 0, itemsPerPage, client);
  }

  const handleClear = () => {
    // Clear all filters and reset to initial state
    setClientEmail("");
    setDateFrom(DEFAULT_DATE_FROM);
    setDateTo(DEFAULT_DATE_TO);
    setHasAppliedFilters(false);
    // Reload with default dates and no filters
    getClientsTable(DEFAULT_DATE_FROM, DEFAULT_DATE_TO, 0, itemsPerPage);
  }

  const endIndex = Math.max(startIndex - 1 + (visibleClients.length), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600 mt-1">Gestiona tu base de clientes</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="email"
                placeholder="Buscar por correo del cliente"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="pl-10 w-full"
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

          {/* Clients Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Reservas</TableHead>
                  <TableHead>Pagos</TableHead>
                  <TableHead>Monto Recibido</TableHead>
                  <TableHead>Última Reserva</TableHead>
                  <TableHead>Último Pago</TableHead>
                  <TableHead>Disciplina Favorita</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleClients.map((client) => (
                  <TableRow key={client.clientInfo.clientId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.clientInfo.clientName || ''}</div>
                        <div className="text-sm text-gray-500">{client.clientInfo.clientEmail}</div>
                        {client.clientInfo.clientPhone && (
                          <div className="text-sm text-gray-500">{client.clientInfo.clientPhone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.totalReservations ?? 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.totalPayments ?? 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">S/ {(client.totalAmountReceived ?? 0).toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateString(client.lastReservationDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDateString(client.lastPaymentDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{client.topDiscipline || '-'}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/clients/${client.clientInfo.clientId}`}>
                        <Button variant="ghost" className="h-8 w-8 p-0" title="Ver Detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {visibleClients.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay clientes disponibles.</p>
            </div>
          )}

          {visibleClients.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex} a {endIndex} de {totalDisplay} clientes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goFirst}
                  disabled={(clientsTable?.page ?? 0) === 0}
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goPrev}
                  disabled={(clientsTable?.page ?? 0) === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goNext}
                  disabled={(clientsTable?.page ?? 0) + 1 >= (clientsTable?.totalPages ?? 1)}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goLast}
                  disabled={(clientsTable?.page ?? 0) + 1 >= (clientsTable?.totalPages ?? 1)}
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
