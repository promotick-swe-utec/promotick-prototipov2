"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GripVertical,
  Trash2,
  Plus,
  Save,
  Eye,
  FileOutput,
} from "lucide-react";
import { clients } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Sample column definitions                                           */
/* ------------------------------------------------------------------ */
interface ColumnDef {
  order: number;
  outputColumn: string;
  sourceField: string;
  defaultValue: string;
}

const sampleColumns: ColumnDef[] = [
  { order: 1, outputColumn: "ID Producto", sourceField: "\u2014", defaultValue: "(vac\u00edo)" },
  { order: 2, outputColumn: "C\u00f3digo", sourceField: "sku", defaultValue: "" },
  { order: 3, outputColumn: "Nombre", sourceField: "display_name", defaultValue: "" },
  { order: 4, outputColumn: "Descripci\u00f3n", sourceField: "long_description", defaultValue: "" },
  { order: 5, outputColumn: "Precio", sourceField: "price", defaultValue: "" },
  { order: 6, outputColumn: "Puntos", sourceField: "precio \u00d7 factor", defaultValue: "(calculado)" },
  { order: 7, outputColumn: "Categor\u00eda", sourceField: "client_category_name", defaultValue: "" },
  { order: 8, outputColumn: "Imagen", sourceField: "image_main_url", defaultValue: "" },
  { order: 9, outputColumn: "ID NetSuite", sourceField: "netsuite_code", defaultValue: "" },
  { order: 10, outputColumn: "Tags", sourceField: "autogenerado IA", defaultValue: "(autogenerado)" },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */
export default function PlantillaSalidaPage() {
  const params = useParams();
  const clientId = Number(params.id);
  const client = clients.find((c) => c.id === clientId);

  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const [includeHeader, setIncludeHeader] = useState(true);

  if (!client) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Cliente no encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      {/* -- Breadcrumb + header -- */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <Link
            href="/clientes"
            className="transition-colors hover:text-brand-600"
          >
            Clientes
          </Link>
          <span>/</span>
          <span className="text-gray-700">{client.name}</span>
          <span>/</span>
          <span className="font-medium text-gray-900">
            Plantilla de Salida
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/clientes"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                <FileOutput className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Plantilla de Salida
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  Configuración de exportación para {client.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Vista Previa
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <Save className="h-4 w-4" />
              Guardar Plantilla
            </button>
          </div>
        </div>
      </div>

      {/* -- Configuration card -- */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Configuración General
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Format selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Formato de Archivo
            </label>
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={format === "xlsx"}
                  onChange={() => setFormat("xlsx")}
                  className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-900">XLSX</span>
                <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">
                  Excel
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === "csv"}
                  onChange={() => setFormat("csv")}
                  className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-gray-900">CSV</span>
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                  Texto
                </span>
              </label>
            </div>
          </div>

          {/* Include header */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Opciones
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={(e) => setIncludeHeader(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-gray-900">
                Incluir encabezado
              </span>
            </label>
          </div>

          {/* Points conversion factor */}
          {client.pointsConversionFactor !== null && (
            <div>
              <label htmlFor="conversionFactor" className="mb-2 block text-sm font-medium text-gray-700">
                Factor de Conversión
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="conversionFactor"
                  type="text"
                  value={client.pointsConversionFactor}
                  readOnly
                  className="w-32 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900"
                />
                <span className="text-xs text-gray-500">puntos / sol</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* -- Column definitions table -- */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Definición de Columnas
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Configura las columnas que se incluirán en el archivo de salida
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar Columna
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="w-12 py-3.5 pl-6 pr-1">#</th>
                <th className="px-3 py-3.5">Columna de Salida</th>
                <th className="px-3 py-3.5">Campo Origen</th>
                <th className="px-3 py-3.5">Valor por Defecto</th>
                <th className="w-24 py-3.5 pl-3 pr-6 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleColumns.map((col) => (
                <tr
                  key={col.order}
                  className="group transition-colors hover:bg-gray-50/60"
                >
                  {/* Order number */}
                  <td className="py-3.5 pl-6 pr-1">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {col.order}
                    </span>
                  </td>

                  {/* Output column name */}
                  <td className="px-3 py-3.5">
                    <span className="font-medium text-gray-900">
                      {col.outputColumn}
                    </span>
                  </td>

                  {/* Source field */}
                  <td className="px-3 py-3.5">
                    {col.sourceField === "\u2014" ? (
                      <span className="text-gray-400">{col.sourceField}</span>
                    ) : (
                      <span className="inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {col.sourceField}
                      </span>
                    )}
                  </td>

                  {/* Default value */}
                  <td className="px-3 py-3.5">
                    {col.defaultValue ? (
                      <span className="text-xs text-gray-500">
                        {col.defaultValue}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Reordenar"
                        className="cursor-grab rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar columna"
                        className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
            <span className="font-medium text-gray-900">
              {sampleColumns.length}
            </span>{" "}
            columnas configuradas — Formato:{" "}
            <span className="font-medium text-gray-900 uppercase">
              {format}
            </span>
            {includeHeader && " con encabezado"}
          </p>
        </div>
      </div>
    </div>
  );
}
