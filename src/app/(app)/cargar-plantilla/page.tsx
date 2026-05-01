"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  ChevronDown,
  X,
  File,
  Search,
  Truck,
} from "lucide-react";
import {
  suppliers,
  sampleColumnMappings,
  targetFields,
  sampleUploadRows,
} from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Step indicator                                                      */
/* ------------------------------------------------------------------ */
const steps = [
  { number: 1, label: "Archivo" },
  { number: 2, label: "Mapeo" },
  { number: 3, label: "Procesamiento" },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <nav className="mb-8 flex items-center justify-center gap-2">
      {steps.map((step, idx) => {
        const isActive = step.number === current;
        const isCompleted = step.number < current;

        return (
          <div key={step.number} className="flex items-center gap-2">
            {/* Connector line */}
            {idx > 0 && (
              <div
                className={`h-0.5 w-10 rounded-full transition-colors duration-300 sm:w-16 ${
                  isCompleted || isActive ? "bg-brand-500" : "bg-gray-200"
                }`}
              />
            )}

            {/* Circle + label */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? "bg-brand-500 text-white"
                    : isActive
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-500/30"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`hidden text-sm font-semibold sm:inline ${
                  isActive
                    ? "text-gray-900"
                    : isCompleted
                      ? "text-brand-600"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Confidence bar                                                      */
/* ------------------------------------------------------------------ */
function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const colorClass =
    pct >= 90
      ? "bg-green-500"
      : pct >= 80
        ? "bg-amber-500"
        : "bg-red-500";
  const textClass =
    pct >= 90
      ? "text-green-700"
      : pct >= 80
        ? "text-amber-700"
        : "text-red-700";

  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold ${textClass}`}>{pct}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1: Select supplier & upload file                               */
/* ------------------------------------------------------------------ */
function StepUpload({
  selectedSupplier,
  onSupplierChange,
  fileUploaded,
  onSimulateUpload,
  onContinue,
}: {
  selectedSupplier: string;
  onSupplierChange: (v: string) => void;
  fileUploaded: boolean;
  onSimulateUpload: () => void;
  onContinue: () => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const activeSuppliers = suppliers.filter((s) => s.isActive);
  const filtered = activeSuppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedName = activeSuppliers.find(
    (s) => String(s.id) === selectedSupplier,
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [search]);

  function scrollToIdx(idx: number) {
    const el = listRef.current?.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }

  function selectSupplier(id: string, name: string) {
    onSupplierChange(id);
    setSearch(name);
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(highlightIdx + 1, filtered.length - 1);
      setHighlightIdx(next);
      setTimeout(() => scrollToIdx(next), 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(highlightIdx - 1, 0);
      setHighlightIdx(prev);
      setTimeout(() => scrollToIdx(prev), 0);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightIdx]) {
        selectSupplier(String(filtered[highlightIdx].id), filtered[highlightIdx].name);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Supplier search */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">
          Proveedor
        </label>
        <p className="mb-3 text-xs text-gray-500">
          Selecciona el proveedor del archivo que vas a cargar
        </p>
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proveedor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
                if (selectedName && e.target.value !== selectedName.name) {
                  onSupplierChange("");
                }
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-gray-200 bg-surface py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            {search && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => { onSupplierChange(""); setSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {!search && (
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            )}
          </div>

          {/* Dropdown list */}
          {isOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
              {filtered.length > 0 ? (
                <ul ref={listRef} className="max-h-48 overflow-y-auto py-1">
                  {filtered.map((s, idx) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => selectSupplier(String(s.id), s.name)}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                          idx === highlightIdx
                            ? "bg-brand-50 text-brand-700"
                            : "text-gray-700"
                        } ${String(s.id) === selectedSupplier ? "font-medium" : ""}`}
                      >
                        <span>{s.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-500">
                    No se encontró ningún proveedor
                  </p>
                  <a
                    href="/proveedores"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Crear nuevo proveedor
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* File drop zone */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">
          Archivo Excel
        </label>
        <p className="mb-3 text-xs text-gray-500">
          Formatos aceptados: .xlsx, .xls, .csv
        </p>

        {!fileUploaded ? (
          <button
            type="button"
            onClick={onSimulateUpload}
            className="group flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-6 py-12 transition-colors hover:border-brand-500 hover:bg-brand-50/30"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
              <Upload className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Arrastra tu archivo Excel aquí o haz clic para
                seleccionar
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Tamaño máximo: 10 MB
              </p>
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  catalogo_proveedor_abril2026.xlsx
                </p>
                <p className="text-xs text-gray-500">245 KB</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Eliminar archivo"
              onClick={() => {}}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Continue button */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!selectedSupplier || !fileUploaded}
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2: Column mapping                                              */
/* ------------------------------------------------------------------ */
function StepMapping({
  onBack,
  onContinue,
}: {
  onBack: () => void;
  onContinue: () => void;
}) {
  const [mappings, setMappings] = useState(
    sampleColumnMappings.map((m) => ({ ...m })),
  );

  function handleTargetChange(idx: number, value: string) {
    setMappings((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, targetField: value } : m)),
    );
  }

  /* Preview data (first 4 rows of sample data) */
  const previewHeaders = [
    "CODIGO",
    "PRODUCTO",
    "MARCA",
    "PRECIO UNIT.",
    "CATEGORIA",
  ];
  const previewRows = sampleUploadRows.slice(0, 4).map((r) => [
    r.sku,
    r.name,
    r.brand,
    r.price,
    r.category,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Mapeo de Columnas
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              La IA ha sugerido el mapeo automático de columnas.
              Verifica y ajusta las correspondencias antes de continuar.
            </p>
          </div>
        </div>
      </div>

      {/* Mapping table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3.5 pl-6 pr-3">Columna Origen</th>
                <th className="px-3 py-3.5">Campo Destino</th>
                <th className="px-3 py-3.5">Confianza IA</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mappings.map((m, idx) => (
                <tr
                  key={m.sourceColumn}
                  className="group transition-colors hover:bg-gray-50/60"
                >
                  {/* Source column */}
                  <td className="py-3.5 pl-6 pr-3">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {m.sourceColumn}
                      </span>
                    </div>
                  </td>

                  {/* Target dropdown */}
                  <td className="px-3 py-3.5">
                    <div className="relative">
                      <select
                        value={m.targetField}
                        onChange={(e) =>
                          handleTargetChange(idx, e.target.value)
                        }
                        aria-label={`Campo destino para ${m.sourceColumn}`}
                        className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        {targetFields.map((tf) => (
                          <option key={tf.value} value={tf.value}>
                            {tf.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </td>

                  {/* Confidence bar */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <ConfidenceBar value={m.confidence} />
                      {m.aiSuggested && (
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-6 text-right">
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Quitar mapeo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview section */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Vista Previa — Primeras filas
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Datos crudos del archivo antes de la normalización
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3 pl-6 pr-3">#</th>
                {previewHeaders.map((h) => (
                  <th key={h} className="px-3 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {previewRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="transition-colors hover:bg-gray-50/60"
                >
                  <td className="py-3 pl-6 pr-3 font-mono text-xs text-gray-400">
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3 py-3 text-gray-700"
                    >
                      {cell || (
                        <span className="italic text-gray-300">
                          vacío
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
        >
          Guardar Plantilla y Continuar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3: Processing                                                  */
/* ------------------------------------------------------------------ */
function StepProcessing({ onFinish }: { onFinish: () => void }) {
  const [isDone, setIsDone] = useState(false);

  /* Simulate processing after mount */
  useState(() => {
    const timer = setTimeout(() => setIsDone(true), 2500);
    return () => clearTimeout(timer);
  });

  const statusItems = [
    { label: "Normalizando precios...", done: true },
    { label: "Detectando duplicados...", done: true },
    { label: "Validando datos...", done: isDone },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Processing card */}
      <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            {isDone
              ? <CheckCircle className="h-8 w-8 text-brand-600" />
              : <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            }
          </div>

          <h2 className="text-lg font-bold text-gray-900">
            {isDone
              ? "Procesamiento completado"
              : "Analizando 8 productos..."}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isDone
              ? "Todos los productos fueron analizados exitosamente"
              : "Esto puede tomar unos segundos"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mt-6 max-w-sm">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>Progreso</span>
            <span className="font-semibold text-gray-700">
              {isDone ? "100%" : "68%"}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full bg-brand-500 transition-all duration-1000 ease-out ${
                isDone ? "w-full" : "w-[68%]"
              }`}
            />
          </div>
        </div>

        {/* Status items */}
        <div className="mt-6 space-y-3">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-2.5"
            >
              {item.done ? (
                <CheckCircle className="h-5 w-5 shrink-0 text-brand-500" />
              ) : (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-gray-400" />
              )}
              <span
                className={`text-sm ${item.done ? "text-gray-700" : "text-gray-500"}`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary card — shown when done */}
      {isDone && (
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Resumen del Procesamiento
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Productos procesados",
                value: "8",
                color: "text-gray-900",
                bg: "bg-gray-50",
              },
              {
                label: "Nuevos",
                value: "5",
                color: "text-brand-700",
                bg: "bg-brand-50",
              },
              {
                label: "Duplicados detectados",
                value: "2",
                color: "text-amber-700",
                bg: "bg-amber-50",
              },
              {
                label: "Con errores",
                value: "1",
                color: "text-red-700",
                bg: "bg-red-50",
              },
            ].map((s) => (
              <div key={s.label} className={`rounded-lg ${s.bg} p-4 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="mt-1 text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <a
              href="/revision-lote"
              onClick={(e) => {
                e.preventDefault();
                onFinish();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
            >
              Ir a Revisión
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                 */
/* ------------------------------------------------------------------ */
export default function CargarPlantillaPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [fileUploaded, setFileUploaded] = useState(false);

  return (
    <div>
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Cargar Plantilla de Proveedor
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Sube un archivo Excel, mapea las columnas y procesa los productos
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={currentStep} />

      {/* Step content */}
      <div className="transition-all duration-300">
        {currentStep === 1 && (
          <StepUpload
            selectedSupplier={selectedSupplier}
            onSupplierChange={setSelectedSupplier}
            fileUploaded={fileUploaded}
            onSimulateUpload={() => setFileUploaded(true)}
            onContinue={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <StepMapping
            onBack={() => setCurrentStep(1)}
            onContinue={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 3 && (
          <StepProcessing
            onFinish={() => {
              window.location.href = "/revision-lote";
            }}
          />
        )}
      </div>
    </div>
  );
}
