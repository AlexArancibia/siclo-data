"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";
import { UploadedFiles } from "@/interfaces/file-type";
import { useMappings } from "@/hooks/use-mappings";
import { Mapping } from "@/interfaces/mapping";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ImportPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({ class: null, payments: null });
  const { 
    reservationsMapping, 
    fetchReservationsMapping, 
    paymentMapping, 
    fetchPaymentMapping, 
    updateMapping,
    importJobs,
    fetchImportJobs
  } = useMappings();
  const [mappingToUpdate, setMappingToUpdate] = useState<Mapping[]>([]);
  const [inputValues, setInputValues] = useState<{ [id: number]: string }>({});
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [appliedDateFrom, setAppliedDateFrom] = useState<string>("");
  const [appliedDateTo, setAppliedDateTo] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchReservationsMapping();
    fetchPaymentMapping();
    
    // Set default date range (last 3 months)
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    const formatDateForInput = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    const defaultFrom = formatDateForInput(threeMonthsAgo);
    const defaultTo = formatDateForInput(today);
    
    setDateFrom(defaultFrom);
    setDateTo(defaultTo);
    setAppliedDateFrom(defaultFrom);
    setAppliedDateTo(defaultTo);
    
    // Cargar datos iniciales con las fechas por defecto
    fetchImportJobs(defaultFrom, defaultTo, 0, pageSize);
  }, []);

  // Solo actualizar cuando cambia la página o las fechas aplicadas
  useEffect(() => {
    if (appliedDateFrom && appliedDateTo) {
      fetchImportJobs(appliedDateFrom, appliedDateTo, currentPage, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, appliedDateFrom, appliedDateTo]);

  const handleDateFilter = () => {
    if (dateFrom && dateTo) {
      // Validar que la fecha "desde" no sea mayor que la fecha "hasta"
      if (new Date(dateFrom) > new Date(dateTo)) {
        toast.error("La fecha 'desde' no puede ser mayor que la fecha 'hasta'");
        return;
      }
      setAppliedDateFrom(dateFrom);
      setAppliedDateTo(dateTo);
      setCurrentPage(0);
    } else {
      toast.error("Por favor selecciona ambas fechas");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      // Parsear la fecha ISO (asume UTC si no tiene zona horaria)
      const date = new Date(dateString);
      
      // Ajustar a la zona horaria de Perú (UTC-5)
      // Restar 5 horas (5 * 60 * 60 * 1000 milisegundos)
      const peruOffsetHours = -5;
      const peruTime = new Date(date.getTime() + (peruOffsetHours * 60 * 60 * 1000));
      
      return format(peruTime, "dd MMM yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'PENDING':
      case 'PROCESSING':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'Completado';
      case 'ERROR':
        return 'Error';
      case 'PENDING':
        return 'Pendiente';
      case 'PROCESSING':
        return 'Procesando';
      default:
        return status;
    }
  };

  const handleFileUpload = (type: keyof UploadedFiles, file: File | null) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [type]: file,
    }));
  };

  const uploadFile = async (type: keyof UploadedFiles) => {
    const file = uploadedFiles[type];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);

    const fileTypeName = type === "class" ? "clases" : "compras";

    try {
      toast.loading(`Procesando archivo de ${fileTypeName}...`, {
        id: "upload-file",
      });

      const endpoint = type === "class"
        ? `${API_BASE_URL}/files/upload/reservations`
        : `${API_BASE_URL}/files/upload/payments`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Error en el POST");

      const result = await res.text();
      console.log(`File uploaded with: ${result}`);
      
      toast.success(`Archivo de ${fileTypeName} procesado correctamente`, {
        id: "upload-file",
      });

      // Limpiar el archivo seleccionado después de procesarlo
      setUploadedFiles((prev) => ({
        ...prev,
        [type]: null,
      }));

      // Refrescar el historial de importaciones con las fechas aplicadas
      if (appliedDateFrom && appliedDateTo) {
        fetchImportJobs(appliedDateFrom, appliedDateTo, currentPage, pageSize);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Error al procesar el archivo de ${fileTypeName}`, {
        id: "upload-file",
      });
    }
  };

  const handleSaveChanges = async () => {
    if (mappingToUpdate.length === 0) {
      toast.info("No hay cambios que guardar");
      return;
    }

    try {
      toast.loading("Guardando cambios...", {
        id: "save-changes",
      });

      await updateMapping(mappingToUpdate);
      setMappingToUpdate([]);
      setInputValues({});
      await Promise.all([fetchReservationsMapping(), fetchPaymentMapping()]);
      
      toast.success("Cambios guardados correctamente", {
        id: "save-changes",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar los cambios", {
        id: "save-changes",
      });
    }
  };

  const handleInputChange = (mappingId: number, newHeader: string, type: string) => {
    setInputValues((prev) => ({ ...prev, [mappingId]: newHeader }));
    setMappingToUpdate((prev) => {
      const existing = prev.find((m) => m.mappingId === mappingId);
      if (existing) {
        return prev.map((m) =>
          m.mappingId === mappingId ? { ...m, excelHeader: newHeader } : m
        );
      } else {
        const base =
          type === 'reservations'
            ? reservationsMapping.find((r) => r.mappingId === mappingId)
            : paymentMapping.find((p) => p.mappingId === mappingId);

        if (!base) return prev;

        return [...prev, { ...base, excelHeader: newHeader }];
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#1F2937]">
          Importar Datos
        </h2>
        <p className="text-[#6B7280] mt-1">
          Importa datos de clases y compras desde archivos Excel
        </p>
      </div>

      <Tabs defaultValue="clases" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-[#F8FAFC] border border-[#E5E7EB] p-1 rounded-lg">
          <TabsTrigger
            value="clases"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E5E7EB] rounded-md font-medium"
          >
            Importar Clases
          </TabsTrigger>
          <TabsTrigger
            value="compras"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E5E7EB] rounded-md font-medium"
          >
            Importar Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clases" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#F8FAFC] shadow-sm border border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#6366F1]" />
                  Subir Archivo de Clases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#1F2937]">
                      Arrastra tu archivo Excel aquí
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    className="mt-4"
                    onChange={(e) =>
                      handleFileUpload("class", e.target.files?.[0] || null)
                    }
                  />
                </div>

                {uploadedFiles.class && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      {uploadedFiles.class.name}
                    </span>
                  </div>
                )}

                <Button
                  className="w-full bg-[#6366F1] hover:bg-[#5B5BD6] cursor-pointer"
                  disabled={!uploadedFiles.class}
                  onClick={() => uploadFile("class")}
                >
                  Procesar Archivo de Clases
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#F8FAFC] shadow-sm border border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#1F2937]">
                  Formato Requerido - Clases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-[#1F2937]">
                    Columnas requeridas:
                  </p>
                  <ul className="space-y-1 text-[#6B7280] max-h-72 overflow-y-scroll scrollbar-visible pr-5">
                    {reservationsMapping.map((res) => (
                      <div key={res.mappingId} className="mb-4">
                        <li className="mb-1">{`• ${res.excelHeader}`}</li>
                        <Input
                          value={inputValues[res.mappingId!] ?? ""}
                          onChange={(e) => handleInputChange(res.mappingId!, e.target.value, 'reservations')}
                        />
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleSaveChanges}
                        className="bg-[#6366F1] hover:bg-[#5B5BD6] text-white cursor-pointer"
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compras" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#F8FAFC] shadow-sm border border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#6366F1]" />
                  Subir Archivo de Compras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-[#1F2937]">
                      Arrastra tu archivo Excel aquí
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      o haz clic para seleccionar
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    className="mt-4"
                    onChange={(e) =>
                      handleFileUpload("payments", e.target.files?.[0] || null)
                    }
                  />
                </div>

                {uploadedFiles.payments && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      {uploadedFiles.payments.name}
                    </span>
                  </div>
                )}

                <Button
                  className="w-full bg-[#6366F1] hover:bg-[#5B5BD6]"
                  disabled={!uploadedFiles.payments}
                  onClick={() => uploadFile("payments")}
                >
                  Procesar Archivo de Compras
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#F8FAFC] shadow-sm border border-[#E5E7EB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#1F2937]">
                  Formato Requerido - Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p className="font-medium text-[#1F2937]">
                    Columnas principales:
                  </p>
                  <ul className="space-y-1 text-[#6B7280] max-h-72 overflow-y-scroll scrollbar-visible pr-5">
                    {paymentMapping.map((res) => (
                      <div key={res.mappingId} className="mb-4">
                        <li className="mb-1">{`• ${res.excelHeader}`}</li>
                        <Input
                          value={inputValues[res.mappingId!] ?? ""}
                          onChange={(e) => handleInputChange(res.mappingId!, e.target.value, 'payment')}
                        />
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSaveChanges}
                        className="bg-[#6366F1] hover:bg-[#5B5BD6] text-white cursor-pointer"
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Historial de importaciones */}
      <Card className="bg-[#F8FAFC] shadow-sm border border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1F2937]">
            Historial de Importaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Date Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">Rango de fechas:</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px] h-9"
              />
              <span className="text-[#6B7280] text-sm">a</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px] h-9"
              />
              <Button 
                size="sm" 
                className="h-9 px-4 bg-[#6366F1] hover:bg-[#5B5BD6]"
                onClick={handleDateFilter}
              >
                Aplicar
              </Button>
            </div>
          </div>

          {/* Import Jobs List */}
          <div className="space-y-3 mb-6">
            {importJobs?.data && importJobs.data.length > 0 ? (
              importJobs.data.map((job) => (
                <div
                  key={job.jobId}
                  className="flex items-center justify-between p-3 bg-white border border-[#E5E7EB] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">
                        {job.fileName}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {job.finishedAt
                          ? `Importado el ${formatDate(job.finishedAt)}`
                          : job.createdAt
                          ? `Subido el ${formatDate(job.createdAt)}`
                          : "Fecha no disponible"}
                        {job.processingResult && ` - ${job.processingResult.totalProcessed.toLocaleString()} registros procesados`}
                        {job.processingResult && job.processingResult.failureCount > 0 && ` (${job.processingResult.failureCount} errores)`}
                        {` - ${getStatusText(job.status)}`}
                        {job.fileType && ` - ${job.fileType === 'PAYMENT' ? 'Compras' : 'Clases'}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#6B7280]">
                No hay importaciones en el rango de fechas seleccionado
              </div>
            )}
          </div>

          {/* Pagination */}
          {importJobs && importJobs.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => {
                      if (currentPage > 0) {
                        setCurrentPage(currentPage - 1);
                      }
                    }}
                    className={
                      currentPage === 0
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {Array.from({ length: importJobs.totalPages }, (_, i) => {
                  if (
                    i === 0 ||
                    i === importJobs.totalPages - 1 ||
                    (i >= currentPage - 1 && i <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i)}
                          isActive={currentPage === i}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (i === currentPage - 2 || i === currentPage + 2) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => {
                      if (currentPage < importJobs.totalPages - 1) {
                        setCurrentPage(currentPage + 1);
                      }
                    }}
                    className={
                      currentPage >= importJobs.totalPages - 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
