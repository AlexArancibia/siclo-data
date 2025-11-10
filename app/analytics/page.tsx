"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import {
  DollarSign,
  Calendar,
  UserPlus,
  Users,
  TrendingUp,
  AlertTriangle,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useReports } from "@/hooks/use-reports"
import { getSeriesKeys, transformReportResponse } from "@/lib/transform-report"
import { formatDate } from "@/lib/format-date"
import { InteractiveChartLegend } from "@/components/interactive-chart-legend"
import { useChartLegend } from "@/hooks/use-chart-legend"

/* const transaccionesMercadoPago = [
  { name: "Ene", aprobadas: 385, pendientes: 25, rechazadas: 15, devueltas: 8 },
  { name: "Feb", transacciones: 445, pendientes: 18, rechazadas: 12, devueltas: 5 },
  { name: "Mar", aprobadas: 580, pendientes: 32, rechazadas: 20, devueltas: 12 },
  { name: "Abr", aprobadas: 620, pendientes: 28, rechazadas: 18, devueltas: 9 },
  { name: "May", aprobadas: 720, pendientes: 35, rechazadas: 25, devueltas: 15 },
  { name: "Jun", aprobadas: 780, pendientes: 30, rechazadas: 22, devueltas: 11 },
] */

const clientesVIP = [
  {
    id: 1,
    nombre: "María González",
    reservas: 67,
    ultimaReserva: "Hoy",
    gastoTotal: "S/2,450",
    disciplinaFavorita: "Yoga",
    estudio: "Miraflores",
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    reservas: 58,
    ultimaReserva: "Ayer",
    gastoTotal: "S/2,180",
    disciplinaFavorita: "CrossFit",
    estudio: "San Isidro",
  },
  {
    id: 3,
    nombre: "Ana Rodríguez",
    reservas: 54,
    ultimaReserva: "2 días",
    gastoTotal: "S/1,980",
    disciplinaFavorita: "Pilates",
    estudio: "Surco",
  },
  {
    id: 4,
    nombre: "Luis Vargas",
    reservas: 52,
    ultimaReserva: "Hoy",
    gastoTotal: "S/1,850",
    disciplinaFavorita: "Spinning",
    estudio: "Lima Centro",
  },
  {
    id: 5,
    nombre: "Patricia Silva",
    reservas: 51,
    ultimaReserva: "3 días",
    gastoTotal: "S/1,720",
    disciplinaFavorita: "Yoga",
    estudio: "Miraflores",
  },
]

const clientesInactivos = [
  {
    id: 1,
    nombre: "Roberto Díaz",
    ultimaReserva: "4 meses",
    totalReservas: 23,
    gastoTotal: "S/890",
    disciplina: "CrossFit",
    estudio: "San Isidro",
  },
  {
    id: 2,
    nombre: "Carmen López",
    ultimaReserva: "5 meses",
    totalReservas: 18,
    gastoTotal: "S/1,200",
    disciplina: "Pilates",
    estudio: "Surco",
  },
  {
    id: 3,
    nombre: "Miguel Torres",
    ultimaReserva: "4 meses",
    totalReservas: 15,
    gastoTotal: "S/650",
    disciplina: "Yoga",
    estudio: "Miraflores",
  },
  {
    id: 4,
    nombre: "Elena Vásquez",
    ultimaReserva: "6 meses",
    totalReservas: 28,
    gastoTotal: "S/780",
    disciplina: "Spinning",
    estudio: "Lima Centro",
  },
  {
    id: 5,
    nombre: "Jorge Ramírez",
    ultimaReserva: "7 meses",
    totalReservas: 12,
    gastoTotal: "S/420",
    disciplina: "CrossFit",
    estudio: "San Isidro",
  },
]

const instructoresTop = [
  {
    id: 1,
    nombre: "Sofia Ramírez",
    totalReservas: 234,
    disciplina: "Yoga",
    estudio: "Miraflores",
    ingresosMes: "S/8,450",
    clientesUnicos: 45,
  },
  {
    id: 2,
    nombre: "Diego Morales",
    totalReservas: 198,
    disciplina: "CrossFit",
    estudio: "San Isidro",
    ingresosMes: "S/7,200",
    clientesUnicos: 38,
  },
  {
    id: 3,
    nombre: "Isabella Cruz",
    totalReservas: 176,
    disciplina: "Pilates",
    estudio: "Surco",
    ingresosMes: "S/6,800",
    clientesUnicos: 42,
  },
  {
    id: 4,
    nombre: "Andrés Vega",
    totalReservas: 165,
    disciplina: "Spinning",
    estudio: "Lima Centro",
    ingresosMes: "S/6,200",
    clientesUnicos: 35,
  },
  {
    id: 5,
    nombre: "Camila Torres",
    totalReservas: 152,
    disciplina: "Yoga",
    estudio: "San Isidro",
    ingresosMes: "S/5,800",
    clientesUnicos: 40,
  },
]


const colorPalette = [
  "#FF6B6B",   // Rojo
  "#4ECDC4",   // Turquesa
  "#45B7D1",   // Azul claro
  "#96CEB4",   // Verde menta
  "#FFA07A",   // Salmón
  "#9370DB",   // Púrpura
  "#20B2AA",   // Verde azulado
  "#FFD700",   // Dorado
  "#FF6347",   // Tomate
  "#40E0D0",   // Turquesa claro
  "#EE82EE",   // Violeta
  "#32CD32",   // Verde lima
  "#FF1493",   // Rosa profundo
  "#00CED1",   // Turquesa oscuro
  "#FF8C00",   // Naranja oscuro
  "#8A2BE2",   // Azul violeta
];

// Paleta de colores más diversa específica para instructores
const instructorColorPalette = [
  "#E74C3C",   // Rojo intenso
  "#3498DB",   // Azul brillante
  "#2ECC71",   // Verde esmeralda
  "#F39C12",   // Naranja
  "#9B59B6",   // Púrpura
  "#1ABC9C",   // Turquesa
  "#E67E22",   // Naranja oscuro
  "#34495E",   // Gris azulado
  "#E91E63",   // Rosa
  "#00BCD4",   // Cian
  "#FF9800",   // Naranja vibrante
  "#673AB7",   // Púrpura profundo
  "#009688",   // Verde azulado
  "#FF5722",   // Rojo anaranjado
  "#3F51B5",   // Azul índigo
  "#795548",   // Marrón
  "#CDDC39",   // Lima
  "#FFC107",   // Ámbar
  "#FF4081",   // Rosa vibrante
  "#00E676",   // Verde neón
];


export default function AnalyticsPage() {
  const [currentPageVIP, setCurrentPageVIP] = useState(1)
  const [currentPageInactivos, setCurrentPageInactivos] = useState(1)
  const [currentPageInstructores, setCurrentPageInstructores] = useState(1)

  // Fechas por defecto: del 1 al 31 de julio
  const DEFAULT_START_DATE = "2025-07-01";
  const DEFAULT_END_DATE = "2025-07-31";
  
  const [startDate, setStartDate] = useState(DEFAULT_START_DATE);
  const [endDate, setEndDate] = useState(DEFAULT_END_DATE);
  const { dataStudio, dataInstructor, dataDiscipline, topDisciplines, paymentMethods, loading, error, fetchReports } = useReports();

  useEffect(() => {
    // Ejecutar fetch con fechas por defecto al cargar la página
    fetchReports(DEFAULT_START_DATE, DEFAULT_END_DATE);
  }, []);

  const dataStudioChart = dataStudio ? transformReportResponse(dataStudio) : [];
  const dataDisciplineChart = dataDiscipline ? transformReportResponse(dataDiscipline) : [];
  const dataInstructorChart = dataInstructor ? transformReportResponse(dataInstructor) : [];

  // Create colors array for useChartLegend hook
  const colorsForLegend = colorPalette.map((color) => ({ stroke: color }));
  const instructorColorsForLegend = instructorColorPalette.map((color) => ({ stroke: color }));
  
  const { hidden: hiddenStudio, legendItems: legendStudioItems, visibleItems: visibleStudioItems, handleLegendClick: handleStudioLegend } = useChartLegend(dataStudioChart, colorsForLegend);
  const { hidden: hiddenDiscipline, legendItems: legendDisciplineItems, visibleItems: visibleDisciplineItems, handleLegendClick: handleDisciplineLegend } = useChartLegend(dataDisciplineChart, colorsForLegend);
  const { hidden: hiddenInstructor, legendItems: legendInstructorItems, visibleItems: visibleInstructorItems, handleLegendClick: handleInstructorLegend } = useChartLegend(dataInstructorChart, instructorColorsForLegend, true);

  const itemsPerPage = 3;

  const paginate = (items: any[], currentPage: number) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return items.slice(startIndex, startIndex + itemsPerPage)
  }

  const getTotalPages = (items: any[]) => Math.ceil(items.length / itemsPerPage)

  // Format payment method name
  const formatPaymentMethodName = (method: string): string => {
    const methodMap: Record<string, string> = {
      credit_card: "Tarjeta de Crédito",
      debit_card: "Tarjeta de Débito",
      bank_transfer: "Transferencia",
      transfer: "Transferencia",
      cash: "Efectivo",
    };
    return methodMap[method] || method;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `S/${new Intl.NumberFormat("es-PE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  // Calculate payment methods percentages and format data
  const formattedPaymentMethods = paymentMethods
    ? paymentMethods.map((method) => {
        const total = paymentMethods.reduce((sum, m) => sum + m.totalAmount, 0);
        const percentage = total > 0 ? Math.round((method.totalAmount / total) * 100) : 0;
        return {
          ...method,
          formattedName: formatPaymentMethodName(method.paymentMethod),
          formattedAmount: formatCurrency(method.totalAmount),
          percentage,
        };
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Resumen General</h2>
          <p className="text-muted-foreground mt-1">Métricas principales del negocio</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm text-muted-foreground">Rango de fechas:</Label>
          </div>

          <div className="flex items-center gap-2">
            <Input type="date" className="w-[160px] h-9" value={startDate} onChange={(e) => setStartDate(e.target.value)}/>
            <span className="text-muted-foreground text-sm">a</span>
            <Input type="date" className="w-[160px] h-9" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
          </div>

          <Button 
            size="sm" 
            className="h-9 px-4" 
            onClick={() => {
              // Si hay fechas seleccionadas, usarlas; sino, usar las fechas por defecto
              const from = startDate || DEFAULT_START_DATE;
              const to = endDate || DEFAULT_END_DATE;
              fetchReports(from, to);
            }}
          >
            Aplicar
          </Button>
        </div>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="gradient-card-red shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 dark:text-red-400 text-lg lg:text-xl font-bold">S/45.2K</p>
                <p className="text-red-800 dark:text-red-300 text-xs mt-1">Ingresos Totales</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-red-600 dark:text-red-400 text-xs">+12% este mes</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card-orange shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 dark:text-orange-400 text-lg lg:text-xl font-bold">1,247</p>
                <p className="text-orange-800 dark:text-orange-300 text-xs mt-1">Total Reservas</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-orange-600 dark:text-orange-400 text-xs">+8% este mes</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card-green shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 dark:text-green-400 text-lg lg:text-xl font-bold">342</p>
                <p className="text-green-800 dark:text-green-300 text-xs mt-1">Clientes Activos</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-green-600 dark:text-green-400 text-xs">+15% este mes</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card-purple shadow-sm">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 dark:text-purple-400 text-lg lg:text-xl font-bold">67</p>
                <p className="text-purple-800 dark:text-purple-300 text-xs mt-1">Nuevos Clientes</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-purple-600 dark:text-purple-400 text-xs">+22% este mes</span>
                </div>
              </div>
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      <Tabs defaultValue="general" className="space-y-6">
        {/* <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted border border-border p-1 rounded-lg">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border rounded-md font-medium text-muted-foreground data-[state=active]:text-foreground"
          >
            General
          </TabsTrigger>
          <TabsTrigger
            value="clientes"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border rounded-md font-medium text-muted-foreground data-[state=active]:text-foreground"
          >
            Clientes
          </TabsTrigger>
          <TabsTrigger
            value="instructores"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border rounded-md font-medium text-muted-foreground data-[state=active]:text-foreground"
          >
            Instructores
          </TabsTrigger>
          <TabsTrigger
            value="estudios"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border rounded-md font-medium text-muted-foreground data-[state=active]:text-foreground"
          >
            Estudios
          </TabsTrigger>
        </TabsList> */}

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="bg-card shadow-sm border border-border">
              <CardHeader className="pb-4 relative">
                <CardTitle className="text-lg font-semibold text-card-foreground">Reservaciones por Estudio</CardTitle>
                <InteractiveChartLegend
                  category="Estudio"
                  items={legendStudioItems}
                  visibleItems={visibleStudioItems}
                  onToggle={handleStudioLegend}
                  showFinder={false}
                />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dataStudioChart}>
                    <defs>
                      {colorPalette.map((color, index) => (
                        <linearGradient key={`studio-gradient-${index}`} id={`studio-color${index + 1}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      ticks={
                        dataStudioChart.length > 0
                        ? [dataStudioChart[0]?.name, dataStudioChart[dataStudioChart.length - 1]?.name]
                        : []
                      }
                      tickFormatter={(value) => formatDate(value)}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "#6B7280" }} 
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip labelFormatter={(value) => formatDate(value)}/>
                    {getSeriesKeys(dataStudioChart).map((key, index) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={colorPalette[index % colorPalette.length]}
                        fillOpacity={1}
                        fill={`url(#studio-color${(index % colorPalette.length) + 1})`}
                        strokeWidth={2}
                        dot={false}
                        name={key}
                        hide={hiddenStudio[key]}
                      />
                    ))}
                    <Legend onClick={handleStudioLegend}/>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border border-border">
              <CardHeader className="pb-4 relative">
                <CardTitle className="text-lg font-semibold text-card-foreground">Reservaciones por Disciplina</CardTitle>
                <InteractiveChartLegend
                  category="Disciplina"
                  items={legendDisciplineItems}
                  visibleItems={visibleDisciplineItems}
                  onToggle={handleDisciplineLegend}
                  showFinder={false}
                />
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dataDisciplineChart}>
                    <defs>
                      {colorPalette.map((color, index) => (
                        <linearGradient key={`discipline-gradient-${index}`} id={`discipline-color${index + 1}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      ticks={
                        dataDisciplineChart.length > 0
                        ? [dataDisciplineChart[0]?.name, dataDisciplineChart[dataDisciplineChart.length - 1]?.name]
                        : []
                      }
                      tickFormatter={(value) => formatDate(value)}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip labelFormatter={(value) => formatDate(value)} />
                    {getSeriesKeys(dataDisciplineChart).map((key, index) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={colorPalette[index % colorPalette.length]}
                        fillOpacity={1}
                        fill={`url(#discipline-color${(index % colorPalette.length) + 1})`}
                        strokeWidth={2}
                        dot={false}
                        name={key}
                        hide={hiddenDiscipline[key]}
                      />
                    ))}
                    <Legend onClick={handleDisciplineLegend}/>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card shadow-sm border border-border">
            <CardHeader className="pb-4 relative">
              <CardTitle className="text-lg font-semibold text-card-foreground">Reservaciones por Instructor</CardTitle>
              <InteractiveChartLegend
                category="Instructor"
                items={legendInstructorItems}
                visibleItems={visibleInstructorItems}
                onToggle={handleInstructorLegend}
                showFinder={true}
              />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dataInstructorChart}>
                  <defs>
                    {instructorColorPalette.map((color, index) => (
                      <linearGradient key={`instructor-gradient-${index}`} id={`instructor-color${index + 1}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: "#6B7280" }}
                      ticks={
                        dataInstructorChart.length > 0
                        ? [dataInstructorChart[0]?.name, dataInstructorChart[dataInstructorChart.length - 1]?.name]
                        : []
                      }
                      tickFormatter={(value) => formatDate(value)}
                    />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip labelFormatter={(value) => formatDate(value)}/>
                  {getSeriesKeys(dataInstructorChart).map((key, index) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={instructorColorPalette[index % instructorColorPalette.length]}
                        fillOpacity={1}
                        fill={`url(#instructor-color${(index % instructorColorPalette.length) + 1})`}
                        strokeWidth={2}
                        dot={false}
                        name={key}
                        hide={hiddenInstructor[key]}
                      />
                    ))}
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* <Card className="bg-card shadow-sm border border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-card-foreground">Transacciones Mercado Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transaccionesMercadoPago}>
                  <defs>
                    <linearGradient id="colorAprobadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRechazadas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="aprobadas"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorAprobadas)"
                    strokeWidth={2}
                    dot={false}
                    name="Aprobadas"
                  />
                  <Area
                    type="monotone"
                    dataKey="pendientes"
                    stroke="#F59E0B"
                    fillOpacity={1}
                    fill="url(#colorPendientes)"
                    strokeWidth={2}
                    dot={false}
                    name="Pendientes"
                  />
                  <Area
                    type="monotone"
                    dataKey="rechazadas"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#colorRechazadas)"
                    strokeWidth={2}
                    dot={false}
                    name="Rechazadas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          {/* Fila inferior */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card shadow-sm border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-card-foreground">Disciplinas Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-medium text-[#6B7280] pb-2">
                    <span>#</span>
                    <span>Disciplina</span>
                    <span className="text-right">Reservas</span>
                  </div>
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  ) : topDisciplines && topDisciplines.length > 0 ? (
                    topDisciplines.map((disciplina, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-sm font-medium text-[#6B7280] w-6">{index + 1}</span>
                          <span className="text-sm font-medium text-[#1F2937] flex-1 text-center pr-10">{disciplina.disciplineName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="text-xs bg-white text-[#374151] border border-[#E5E7EB]">
                            {disciplina.totalReservations}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-sm border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-card-foreground">Métodos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  ) : formattedPaymentMethods.length > 0 ? (
                    formattedPaymentMethods.map((metodo, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#374151] font-medium">{metodo.formattedName}</span>
                          <span className="font-semibold text-[#1F2937]">{metodo.formattedAmount}</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-2 border border-[#E5E7EB]">
                          <div className="bg-[#6366F1] h-2 rounded-full" style={{ width: `${metodo.percentage}%` }}></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#6B7280]">
                          <span>{metodo.transactionCount} transacciones</span>
                          <span>{metodo.percentage}%</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">No hay datos disponibles</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
