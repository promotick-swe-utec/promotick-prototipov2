"use client";

import { useState, useCallback } from "react";
import {
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { clients, exportJobs, type ExportJob } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Status badge                                                        */
/* ------------------------------------------------------------------ */
function ExportStatusBadge({ status }: { status: ExportJob["status"] }) {
  const config: Record<
    ExportJob["status"],
    { label: string; bg: string; text: string; ring: string; icon: React.ReactNode }
  > = {
    completed: {
      label: "Completado",
      bg: "bg-green-50",
      text: "text-green-700",
      ring: "ring-green-600/20",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    processing: {
      label: "Procesando",
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "ring-blue-600/20",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    failed: {
      label: "Fallido",
      bg: "bg-red-50",
      text: "text-red-700",
      ring: "ring-red-600/20",
      icon: <XCircle className="h-3 w-3" />,
    },
    pending: {
      label: "Pendiente",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      ring: "ring-yellow-600/20",
      icon: <Clock className="h-3 w-3" />,
    },
  };

  const c = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */
export default function ExportarPage() {
  const [selectedClient, setSelectedClient] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeClients = clients.filter((c) => c.isActive);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    setIsComplete(false);
    setProgress(0);

    // Simulate progress
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setIsGenerating(false);
          setIsComplete(true);
        }, 500);
      } else {
        setProgress(Math.round(current));
      }
    }, 300);
  }, []);

  const selectedClientName =
    activeClients.find((c) => c.id === Number(selectedClient))?.name ||
    "Tienda Ripley Web";

  return (
    <div>
      {/* -- Page header -- */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
          <FileSpreadsheet className="h-5 w-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Generar Plantilla de Salida
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Exporta el catálogo de productos según la configuración del
            cliente seleccionado
          </p>
        </div>
      </div>

      {/* -- Config section card -- */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">
            Configuración de Exportación
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Client selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              aria-label="Seleccionar cliente"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Seleccionar cliente...</option>
              {activeClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrar por categoría"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todas las categorías</option>
              <option value="electronica">Electrónica</option>
              <option value="hogar">Hogar</option>
              <option value="alimentacion">Alimentación</option>
              <option value="deportes">Deportes</option>
              <option value="cuidado-personal">Cuidado Personal</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Estado del Producto
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar por estado del producto"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="draft">Borrador</option>
              <option value="inactive">Inactivo</option>
              <option value="pending_confirmation">
                Pendiente Confirmación
              </option>
            </select>
          </div>

          {/* Date from */}
          <div>
            <label htmlFor="date-from" className="mb-1.5 block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                Desde
              </span>
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Date to */}
          <div>
            <label htmlFor="date-to" className="mb-1.5 block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                Hasta
              </span>
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Counter + generate */}
          <div className="flex flex-col justify-end">
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2">
              <AlertCircle className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">
                156 productos coinciden con los filtros
              </span>
            </div>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4" />
                  Generar Archivo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* -- Progress section -- */}
      {(isGenerating || isComplete) && (
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          {isGenerating && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-brand-600" />
                <span className="text-sm font-semibold text-gray-900">
                  Generando plantilla para {selectedClientName}...
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-3 rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{progress}% completado</p>
            </div>
          )}

          {isComplete && (
            <div className="flex flex-col items-center gap-4 py-4 sm:flex-row">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-semibold text-gray-900">
                  Archivo generado exitosamente
                </p>
                <p className="text-sm text-gray-500">
                  {selectedClientName} — 156 productos exportados
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                <Download className="h-4 w-4" />
                Descargar ripley_catalogo_20260428.xlsx
              </button>
            </div>
          )}
        </div>
      )}

      {/* -- Export History section -- */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Historial de Exportaciones
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Últimas exportaciones generadas por el equipo
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3.5 pl-6 pr-3">Cliente</th>
                <th className="px-3 py-3.5">Archivo</th>
                <th className="px-3 py-3.5 text-center">Productos</th>
                <th className="px-3 py-3.5 text-center">Estado</th>
                <th className="px-3 py-3.5">Generado por</th>
                <th className="px-3 py-3.5">Fecha</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {exportJobs.map((job) => (
                <tr
                  key={job.id}
                  className="group transition-colors hover:bg-gray-50/60"
                >
                  {/* Client */}
                  <td className="py-4 pl-6 pr-3 font-medium text-gray-900">
                    {job.clientName}
                  </td>

                  {/* File name */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="font-mono text-xs text-gray-600">
                        {job.fileName}
                      </span>
                    </div>
                  </td>

                  {/* Products count */}
                  <td className="px-3 py-4 text-center font-semibold text-gray-900">
                    {job.totalProducts > 0 ? job.totalProducts : "\u2014"}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-4 text-center">
                    <ExportStatusBadge status={job.status} />
                  </td>

                  {/* Generated by */}
                  <td className="px-3 py-4 text-gray-600">
                    {job.generatedBy}
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4 text-gray-500">{job.createdAt}</td>

                  {/* Actions */}
                  <td className="py-4 pl-3 pr-6">
                    <div className="flex justify-end">
                      {job.status === "completed" ? (
                        <button
                          type="button"
                          title="Descargar archivo"
                          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Descargar
                        </button>
                      ) : job.status === "processing" ? (
                        <span className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          En proceso
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 text-xs text-gray-400">
                          —
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="border-t border-gray-100 px-6 py-3.5">
          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-medium text-gray-900">
              {exportJobs.length}
            </span>{" "}
            exportaciones
          </p>
        </div>
      </div>
    </div>
  );
}
