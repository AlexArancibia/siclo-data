"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import Link from "next/link"
import { useClientsView } from "@/hooks/use-clients-view"

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Activo":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Activo</Badge>
    case "VIP":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">VIP</Badge>
    case "Inactivo":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactivo</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

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
      getClientsTable('2025-07-07', '2025-07-20', 0, itemsPerPage)
    })
    return () => cancelAnimationFrame(rafId)
  }, [])

  const endIndex = Math.max(startIndex - 1 + (visibleClients.length), 0)

  // Calculate stats from API summary
  const totalClients = clientsTable?.summary?.totalClients ?? totalDisplay
  const activeClients = clientsTable?.summary?.activeClients ?? 0
  const vipClients = clientsTable?.summary?.vipClients ?? 0
  const totalRevenue = clientsTable?.summary?.totalRevenue ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
          <p className="text-gray-600 mt-1">Gestiona tu base de clientes</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                <p className="text-3xl font-bold text-green-700">{activeClients}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes VIP</p>
                <p className="text-3xl font-bold text-purple-700">{vipClients}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-orange-700">S/ {(totalRevenue ?? 0).toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="España">España</SelectItem>
                  <SelectItem value="México">México</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Colombia">Colombia</SelectItem>
                  <SelectItem value="Brasil">Brasil</SelectItem>
                </SelectContent>
              </Select>
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

          {/* Clients Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Clases</TableHead>
                  <TableHead>Gastado</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Clase Favorita</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                        {client.phone && (
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.city}</div>
                        <div className="text-sm text-gray-500">{client.country}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{client.totalClasses ?? 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">S/ {(client.totalSpent ?? 0).toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {client.lastVisit ? new Date(client.lastVisit).toLocaleDateString("es-ES") : '-'}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{client.favoriteClass || '-'}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/clients/${client.id}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Ver Detalles
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
