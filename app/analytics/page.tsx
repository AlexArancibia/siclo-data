"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Calendar } from "lucide-react"
import { useEffect } from "react"
import { useReports } from "@/hooks/use-reports"
import { getSeriesKeys, transformReportResponse } from "@/lib/transform-report"
import { formatDate, getDefaultMonthDateRange } from "@/lib/format-date"
import { InteractiveChartLegend } from "@/components/interactive-chart-legend"
import { useChartLegend } from "@/hooks/use-chart-legend"
import { useDate } from "@/contexts/date-context"

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
  "#1F77B4", // Azul
  "#FF7F0E", // Naranja
  "#2CA02C", // Verde
  "#D62728", // Rojo
  "#9467BD", // Violeta
  "#8C564B", // Marrón
  "#E377C2", // Rosa
  "#7F7F7F", // Gris
  "#BCBD22", // Lima
  "#17BECF", // Celeste

  "#393B79", // Azul oscuro
  "#637939", // Verde oliva
  "#8C6D31", // Ocre
  "#843C39", // Rojo oscuro
  "#7B4173", // Violeta profundo

  "#AEC7E8", // Azul claro
  "#FFBB78", // Durazno
  "#98DF8A", // Verde pastel
  "#FF9896", // Rosa claro
  "#C5B0D5", // Lavanda

  "#C49C94", // Marrón claro
  "#F7B6D2", // Rosa bebé
  "#C7C7C7", // Gris claro
  "#DBDB8D", // Amarillo pálido
  "#9EDAE5", // Aqua suave

  "#2B8CBE", // Azul turquesa
  "#F03B20", // Rojo brillante
  "#5AC8FA", // Azul iOS
  "#34A853", // Verde Google
  "#FBBC05", // Amarillo Google
];


export default function AnalyticsPage() {
  const { from: DEFAULT_START_DATE, to: DEFAULT_END_DATE } = getDefaultMonthDateRange();
  
  const { startDate, endDate, setStartDate, setEndDate } = useDate();
  const { dataStudio, dataInstructor, dataStudioDiscipline, dataDiscipline, topDisciplines, paymentMethods, loading, fetchReports } = useReports();

  useEffect(() => {
    // Ejecutar fetch con fechas por defecto al cargar la página
    fetchReports(DEFAULT_START_DATE, DEFAULT_END_DATE);
  }, []);

  const dataStudioChart = dataStudio ? transformReportResponse(dataStudio) : [];
  const dataInstructorChart = dataInstructor ? transformReportResponse(dataInstructor) : [];
  const dataStudioDisciplineChart = dataStudioDiscipline ? transformReportResponse(dataStudioDiscipline) : [];
  const dataDisciplineChart = dataDiscipline ? transformReportResponse(dataDiscipline) : [];

  // Create colors array for useChartLegend hook
  const colorsForLegend = colorPalette.map((color) => ({ stroke: color }));
  const instructorColorsForLegend = instructorColorPalette.map((color) => ({ stroke: color }));
  
  const { hidden: hiddenStudio, legendItems: legendStudioItems, visibleItems: visibleStudioItems, handleLegendClick: handleStudioLegend } = useChartLegend(dataStudioChart, colorsForLegend);
  const { hidden: hiddenDiscipline, legendItems: legendDisciplineItems, visibleItems: visibleDisciplineItems, handleLegendClick: handleDisciplineLegend } = useChartLegend(dataDisciplineChart, colorsForLegend);
  const { hidden: hiddenInstructor, legendItems: legendInstructorItems, visibleItems: visibleInstructorItems, handleLegendClick: handleInstructorLegend } = useChartLegend(dataInstructorChart, instructorColorsForLegend, true);
  const { hidden: hiddenStudioDiscipline, legendItems: legendStudioDisciplineItems, visibleItems: visibleDisciplineStudioItems, handleLegendClick: handleDisciplineStudioLegend } = useChartLegend(dataStudioDisciplineChart, instructorColorsForLegend, true);

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
            <Input type="date" className="w-[160px] h-9" value={startDate || ""} onChange={(e) => setStartDate(e.target.value)}/>
            <span className="text-muted-foreground text-sm">a</span>
            <Input type="date" className="w-[160px] h-9" value={endDate || ""} onChange={(e) => setEndDate(e.target.value)}/>
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

      <Tabs defaultValue="general" className="space-y-6">
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
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  </div>
                ) : dataStudioChart.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-sm text-muted-foreground">No hay datos en las fechas seleccionadas</div>
                  </div>
                ) : (
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
                )}
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
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-sm text-muted-foreground">Cargando...</div>
                  </div>
                ) : dataDisciplineChart.length === 0 ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <div className="text-sm text-muted-foreground">No hay datos en las fechas seleccionadas</div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card shadow-sm border border-border">
            <CardHeader className="pb-4 relative">
              <CardTitle className="text-lg font-semibold text-card-foreground">Reservaciones por Estudio por Disciplina</CardTitle>
              <InteractiveChartLegend
                category="Estudio por Disciplina"
                items={legendStudioDisciplineItems}
                visibleItems={visibleDisciplineStudioItems}
                onToggle={handleDisciplineStudioLegend}
                showFinder={true}
              />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-sm text-muted-foreground">Cargando...</div>
                </div>
              ) : dataStudioDisciplineChart.length === 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-sm text-muted-foreground">No hay datos en las fechas seleccionadas</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dataStudioDisciplineChart}>
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
                          dataStudioDisciplineChart.length > 0
                          ? [dataStudioDisciplineChart[0]?.name, dataStudioDisciplineChart[dataStudioDisciplineChart.length - 1]?.name]
                          : []
                        }
                        tickFormatter={(value) => formatDate(value)}
                      />
                    <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                    <Tooltip labelFormatter={(value) => formatDate(value)}/>
                    {getSeriesKeys(dataStudioDisciplineChart).map((key, index) => (
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
                          hide={hiddenStudioDiscipline[key]}
                        />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

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
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-sm text-muted-foreground">Cargando...</div>
                </div>
              ) : dataInstructorChart.length === 0 ? (
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-sm text-muted-foreground">No hay datos en las fechas seleccionadas</div>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>

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
