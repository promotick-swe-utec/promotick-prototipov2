"use client";

import { useState, useMemo } from "react";
import {
  Check,
  X,
  Pencil,
  AlertTriangle,
  GitMerge,
  Copy,
  ArrowRight,
  Package,
  CheckCircle,
  XCircle,
  ArrowDown,
  ArrowUp,
  Undo2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { sampleUploadRows, categories, products, type UploadRow } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
type TabKey = "new" | "duplicate" | "error";

interface TabDef {
  key: TabKey;
  label: string;
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers: parse price and compute percent change                      */
/* ------------------------------------------------------------------ */
function parsePriceToNumber(price?: string) {
  if (!price) return NaN;
  // remove currency symbols and whitespace, then remove thousands separators
  const cleaned = price.replace(/[^0-9.,-]+/g, "").replace(/,/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

function computePctChange(newPriceStr: string, oldPriceStr: string): number | null {
  const newNum = parsePriceToNumber(newPriceStr);
  const oldNum = parsePriceToNumber(oldPriceStr);
  if (!isFinite(newNum) || !isFinite(oldNum) || oldNum === 0) return null;
  return ((newNum - oldNum) / oldNum) * 100;
}

type DuplicateResolution = "pending" | "merged" | "kept_both" | "rejected";

interface ExistingProduct {
  netsuiteCode: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  sku: string;
}

interface MergedProduct {
  netsuiteCode: string;
  sku: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  updatedFields: string[];
}

/* Map duplicate codes to existing products */
const existingByCode: Record<string, ExistingProduct> = {
  "NS-EL-01-0234": {
    netsuiteCode: "NS-EL-01-0234",
    name: "Audífono Bluetooth Sony WH-1000XM5",
    brand: "Sony",
    price: "S/ 1,299.00",
    category: "Electrónica",
    sku: "AUD-BT-500X",
  },
  "NS-EL-02-0189": {
    netsuiteCode: "NS-EL-02-0189",
    name: "Cargador USB-C 30W Anker",
    brand: "Anker",
    price: "S/ 89.90",
    category: "Electrónica",
    sku: "CHG-USB-C30W",
  },
};

function buildMergedProduct(
  row: UploadRow,
  existing: ExistingProduct,
): MergedProduct {
  const updated: string[] = [];

  if (row.name !== existing.name) updated.push("nombre");
  if (row.price !== existing.price) updated.push("precio");
  if (row.brand !== existing.brand) updated.push("marca");

  return {
    netsuiteCode: existing.netsuiteCode,
    sku: existing.sku,
    name: row.name,
    brand: row.brand,
    price: row.price,
    category: row.category || existing.category,
    updatedFields: updated,
  };
}

/* ------------------------------------------------------------------ */
/*  Summary stat card                                                   */
/* ------------------------------------------------------------------ */
function SummaryCard({
  label,
  value,
  icon,
  accentBg,
  accentText,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentBg: string;
  accentText: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${accentBg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold ${accentText}`}>{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Nuevos table                                                        */
/* ------------------------------------------------------------------ */
function NuevosTab({
  rows,
  confirmedIds,
  rejectedIds,
  onConfirm,
  onReject,
  onConfirmAll,
  onRejectAll,
}: {
  rows: UploadRow[];
  confirmedIds: Set<number>;
  rejectedIds: Set<number>;
  onConfirm: (row: number) => void;
  onReject: (row: number) => void;
  onConfirmAll: () => void;
  onRejectAll: () => void;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onConfirmAll}
          className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          <Check className="h-4 w-4" />
          Confirmar Todos
        </button>
        <button
          type="button"
          onClick={onRejectAll}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
        >
          <X className="h-4 w-4" />
          Rechazar Todos
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3.5 pl-6 pr-3">#</th>
                <th className="px-3 py-3.5">SKU</th>
                <th className="px-3 py-3.5">Nombre</th>
                <th className="px-3 py-3.5">Marca</th>
                <th className="px-3 py-3.5">Precio</th>
                <th className="px-3 py-3.5">Categoría</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row) => {
                const isConfirmed = confirmedIds.has(row.rowNumber);
                const isRejected = rejectedIds.has(row.rowNumber);
                return (
                  <tr
                    key={row.rowNumber}
                    className={`group transition-colors ${isConfirmed
                      ? "bg-green-50/40"
                      : isRejected
                        ? "bg-red-50/30"
                        : "hover:bg-gray-50/60"
                      }`}
                  >
                    <td className="py-3.5 pl-6 pr-3 font-mono text-xs text-gray-400">
                      {row.rowNumber}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
                        {row.sku}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-3 py-3.5 text-gray-600">{row.brand}</td>
                    <td className="px-3 py-3.5 font-medium text-gray-900">
                      {row.price}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="Confirmar"
                          onClick={() => onConfirm(row.rowNumber)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all focus:outline-none cursor-pointer ${isConfirmed
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-transparent text-gray-400 hover:bg-green-50 hover:text-green-600"
                            }`}
                        >
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          title="Rechazar"
                          onClick={() => onReject(row.rowNumber)}
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all focus:outline-none cursor-pointer ${isRejected
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-transparent text-gray-400 hover:bg-red-50 hover:text-red-600"
                            }`}
                        >
                          <X className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          title="Editar"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-transparent text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600 focus:outline-none cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Duplicados tab                                                      */
/* ------------------------------------------------------------------ */
function DuplicadosTab({
  rows,
  resolutions,
  mergedProducts,
  onMerge,
  onKeepBoth,
  onReject,
  onUndo,
}: {
  rows: UploadRow[];
  resolutions: Record<number, DuplicateResolution>;
  mergedProducts: Record<number, MergedProduct>;
  onMerge: (rowNumber: number) => void;
  onKeepBoth: (rowNumber: number) => void;
  onReject: (rowNumber: number) => void;
  onUndo: (rowNumber: number) => void;
}) {
  return (
    <div className="space-y-6">
      {rows.map((row) => {
        const pct = Math.round((row.similarityScore ?? 0) * 100);
        const existing = existingByCode[row.duplicateOf ?? ""];
        const resolution = resolutions[row.rowNumber] ?? "pending";
        const merged = mergedProducts[row.rowNumber];

        /* ── Already resolved ── */
        if (resolution !== "pending") {
          return (
            <div
              key={row.rowNumber}
              className={`rounded-xl shadow-sm ring-1 ring-black/5 ${resolution === "merged"
                ? "bg-brand-50/40 ring-brand-200"
                : resolution === "kept_both"
                  ? "bg-blue-50/40 ring-blue-200"
                  : "bg-red-50/30 ring-red-200"
                }`}
            >
              {/* Resolution header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  {resolution === "merged" && (
                    <>
                      <CheckCircle className="h-5 w-5 text-brand-600" />
                      <h3 className="text-sm font-semibold text-brand-800">
                        Fusionado — Se actualizará el producto existente
                      </h3>
                    </>
                  )}
                  {resolution === "kept_both" && (
                    <>
                      <Copy className="h-5 w-5 text-blue-600" />
                      <h3 className="text-sm font-semibold text-blue-800">
                        Se mantendrán ambos productos
                      </h3>
                    </>
                  )}
                  {resolution === "rejected" && (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <h3 className="text-sm font-semibold text-red-700">
                        Producto nuevo rechazado
                      </h3>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onUndo(row.rowNumber)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Deshacer
                </button>
              </div>

              {/* Show merged result for fusions */}
              {resolution === "merged" && merged && (
                <div className="border-t border-brand-200/60 px-6 py-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-700">
                    Resultado de la fusión
                  </p>
                  <div className="rounded-lg border border-brand-200 bg-white p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="inline-flex rounded-md bg-brand-50 px-2.5 py-1 font-mono text-sm font-bold text-brand-700 ring-1 ring-inset ring-brand-500/20">
                        {merged.netsuiteCode}
                      </span>
                      <span className="text-xs text-gray-400">
                        Código NetSuite conservado
                      </span>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-gray-500">SKU</dt>
                        <dd className="font-mono text-xs font-medium text-gray-900">
                          {merged.sku}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Nombre</dt>
                        <dd className="font-medium text-gray-900">
                          {merged.name}
                          {merged.updatedFields.includes("nombre") && (
                            <span className="ml-1.5 inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-500/20">
                              actualizado
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Marca</dt>
                        <dd className="text-gray-700">
                          {merged.brand}
                          {merged.updatedFields.includes("marca") && (
                            <span className="ml-1.5 inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-500/20">
                              actualizado
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Precio</dt>
                        <dd className="font-medium text-gray-900">
                          {merged.price}
                          {merged.updatedFields.includes("precio") && (
                            <span className="ml-1.5 inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-500/20">
                              actualizado
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Categoría</dt>
                        <dd className="text-gray-700">{merged.category}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          );
        }

        /* ── Pending resolution — show comparison ── */
        return (
          <div
            key={row.rowNumber}
            className="rounded-xl bg-white shadow-sm ring-1 ring-black/5"
          >
            {/* Similarity header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <GitMerge className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Posible duplicado detectado
                </h3>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-500/20">
                {pct}% similar
              </span>
            </div>

            {/* Side by side comparison */}
            <div className="grid gap-0 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 divide-gray-100">
              {/* New product (left) */}
              <div className="p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/10">
                    Producto Nuevo
                  </span>
                </div>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">SKU</dt>
                    <dd className="font-mono text-xs font-medium text-gray-900">
                      {row.sku}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Nombre</dt>
                    <dd className="max-w-[200px] text-right font-medium text-gray-900">
                      {row.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Marca</dt>
                    <dd className="text-gray-700">{row.brand}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Precio</dt>
                    <dd className="font-medium text-gray-900">
                      {row.price}
                      {existing && (
                        (() => {
                          const pct = computePctChange(row.price, existing.price);
                          if (pct === null) return null;
                          const abs = Math.abs(pct);
                          const isUp = pct > 0;
                          return (
                            <span className="ml-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-500/10">
                              {isUp ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )}
                              <span>{`${isUp ? "+" : "-"}${abs.toFixed(1)}%`}</span>
                            </span>
                          );
                        })()
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Categoría</dt>
                    <dd className="text-gray-700">{row.category}</dd>
                  </div>
                </dl>
              </div>

              {/* Existing product (right) */}
              <div className="bg-gray-50/40 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    Producto Existente
                  </span>
                </div>
                {existing ? (
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Código NS</dt>
                      <dd className="inline-flex rounded-md bg-brand-50 px-2 py-0.5 font-mono text-xs font-bold text-brand-700">
                        {existing.netsuiteCode}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Nombre</dt>
                      <dd className="max-w-[200px] text-right font-medium text-gray-900">
                        {existing.name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Marca</dt>
                      <dd className="text-gray-700">{existing.brand}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Precio</dt>
                      <dd className="font-medium text-gray-900">
                        {existing.price}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Categoría</dt>
                      <dd className="text-gray-700">{existing.category}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-gray-400">
                    Código: {row.duplicateOf}
                  </p>
                )}
              </div>
            </div>

            {/* Merge explanation */}
            <div className="border-t border-gray-100 bg-amber-50/30 px-6 py-3">
              <p className="flex items-center gap-2 text-xs text-amber-700">
                <ArrowDown className="h-3.5 w-3.5" />
                <strong>Combinar:</strong> actualiza los campos del producto existente con los nuevos datos y conserva el código NetSuite <strong>{existing?.netsuiteCode ?? row.duplicateOf}</strong>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => onMerge(row.rowNumber)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                <GitMerge className="h-4 w-4" />
                Combinar
              </button>
              <button
                type="button"
                onClick={() => onKeepBoth(row.rowNumber)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
                Mantener Ambos
              </button>
              <button
                type="button"
                onClick={() => onReject(row.rowNumber)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
              >
                <X className="h-4 w-4" />
                Rechazar Nuevo
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Errores tab                                                         */
/* ------------------------------------------------------------------ */

/* Build flat list of subcategories for dropdown */
const subcategoryOptions = categories.flatMap((cat) =>
  cat.subcategories.map((sub) => ({
    value: `${cat.name} > ${sub.name}`,
    label: `${cat.name} > ${sub.name}`,
  })),
);

function ErroresTab({
  rows,
  corrections,
  onCorrect,
}: {
  rows: UploadRow[];
  corrections: Record<number, string>;
  onCorrect: (rowNumber: number, category: string) => void;
}) {
  const [editingRow, setEditingRow] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3">
        <p className="flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Los productos con errores necesitan corrección manual antes de poder confirmarlos.
          Selecciona la categoría correcta para cada uno.
        </p>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3.5 pl-6 pr-3">#</th>
                <th className="px-3 py-3.5">SKU</th>
                <th className="px-3 py-3.5">Nombre</th>
                <th className="px-3 py-3.5">Marca</th>
                <th className="px-3 py-3.5">Precio</th>
                <th className="px-3 py-3.5">Categoría</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row) => {
                const corrected = corrections[row.rowNumber];
                const isEditing = editingRow === row.rowNumber;

                return (
                  <tr
                    key={row.rowNumber}
                    className={`transition-colors ${corrected
                      ? "bg-brand-50/30"
                      : "bg-red-50/30 hover:bg-red-50/60"
                      }`}
                  >
                    <td className="py-3.5 pl-6 pr-3 font-mono text-xs text-gray-400">
                      {row.rowNumber}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
                        {row.sku}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-medium text-gray-900">
                      {row.name}
                    </td>
                    <td className="px-3 py-3.5 text-gray-600">{row.brand}</td>
                    <td className="px-3 py-3.5 font-medium text-gray-900">
                      {row.price}
                    </td>
                    <td className="px-3 py-3.5">
                      {corrected ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 shrink-0 text-brand-600" />
                          <span className="text-sm font-medium text-brand-700">
                            {corrected}
                          </span>
                        </div>
                      ) : isEditing ? (
                        <select
                          autoFocus
                          aria-label="Seleccionar categoría"
                          className="w-full rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              onCorrect(row.rowNumber, e.target.value);
                              setEditingRow(null);
                            }
                          }}
                          onBlur={() => setEditingRow(null)}
                        >
                          <option value="" disabled>
                            Seleccionar categoría...
                          </option>
                          {subcategoryOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                          <span className="text-sm font-medium text-red-700">
                            Categoría no encontrada
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 pl-3 pr-6 text-right">
                      {corrected ? (
                        <button
                          type="button"
                          onClick={() => {
                            onCorrect(row.rowNumber, "");
                            setEditingRow(row.rowNumber);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Cambiar
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingRow(row.rowNumber)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Corregir
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                 */
/* ------------------------------------------------------------------ */
export default function RevisionLotePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("new");
  const [confirmedIds, setConfirmedIds] = useState<Set<number>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<number>>(new Set());

  /* Duplicate resolution state */
  const [dupResolutions, setDupResolutions] = useState<
    Record<number, DuplicateResolution>
  >({});
  const [mergedProducts, setMergedProducts] = useState<
    Record<number, MergedProduct>
  >({});

  /* Error corrections state: rowNumber → selected category */
  const [errorCorrections, setErrorCorrections] = useState<
    Record<number, string>
  >({});

  /* Partition rows by status */
  const newRows = useMemo(
    () => sampleUploadRows.filter((r) => r.status === "new"),
    [],
  );
  const duplicateRows = useMemo(
    () => sampleUploadRows.filter((r) => r.status === "duplicate"),
    [],
  );
  const errorRows = useMemo(
    () => sampleUploadRows.filter((r) => r.status === "error"),
    [],
  );

  const tabs: TabDef[] = [
    { key: "new", label: "Nuevos", count: newRows.length },
    {
      key: "duplicate",
      label: "Posibles Duplicados",
      count: duplicateRows.length,
    },
    { key: "error", label: "Errores", count: errorRows.length },
  ];

  /* ── New rows actions ── */
  function handleConfirm(rowNumber: number) {
    setConfirmedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
        setRejectedIds((r) => {
          const nr = new Set(r);
          nr.delete(rowNumber);
          return nr;
        });
      }
      return next;
    });
  }

  function handleReject(rowNumber: number) {
    setRejectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
        setConfirmedIds((c) => {
          const nc = new Set(c);
          nc.delete(rowNumber);
          return nc;
        });
      }
      return next;
    });
  }

  function handleConfirmAll() {
    setConfirmedIds(new Set(newRows.map((r) => r.rowNumber)));
    setRejectedIds(new Set());
  }

  function handleRejectAll() {
    setRejectedIds(new Set(newRows.map((r) => r.rowNumber)));
    setConfirmedIds(new Set());
  }

  /* ── Duplicate actions ── */
  function handleMerge(rowNumber: number) {
    const row = duplicateRows.find((r) => r.rowNumber === rowNumber);
    if (!row || !row.duplicateOf) return;

    const existing = existingByCode[row.duplicateOf];
    if (!existing) return;

    const merged = buildMergedProduct(row, existing);

    setDupResolutions((prev) => ({ ...prev, [rowNumber]: "merged" }));
    setMergedProducts((prev) => ({ ...prev, [rowNumber]: merged }));
  }

  function handleKeepBoth(rowNumber: number) {
    setDupResolutions((prev) => ({ ...prev, [rowNumber]: "kept_both" }));
  }

  function handleRejectDuplicate(rowNumber: number) {
    setDupResolutions((prev) => ({ ...prev, [rowNumber]: "rejected" }));
    setMergedProducts((prev) => {
      const next = { ...prev };
      delete next[rowNumber];
      return next;
    });
  }

  function handleUndoDuplicate(rowNumber: number) {
    setDupResolutions((prev) => {
      const next = { ...prev };
      delete next[rowNumber];
      return next;
    });
    setMergedProducts((prev) => {
      const next = { ...prev };
      delete next[rowNumber];
      return next;
    });
  }

  /* ── Error corrections ── */
  function handleErrorCorrect(rowNumber: number, category: string) {
    setErrorCorrections((prev) => {
      if (!category) {
        const next = { ...prev };
        delete next[rowNumber];
        return next;
      }
      return { ...prev, [rowNumber]: category };
    });
  }

  /* ── Counts ── */
  const resolvedDupCount = Object.values(dupResolutions).filter(
    (r) => r === "merged" || r === "kept_both",
  ).length;
  const correctedErrorCount = Object.keys(errorCorrections).filter(
    (k) => errorCorrections[Number(k)],
  ).length;
  const confirmedCount = confirmedIds.size + resolvedDupCount + correctedErrorCount;
  const totalActionable = newRows.length + duplicateRows.length + errorRows.length;

  return (
    <div className="pb-24">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Revisión de Lote
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Proveedor:{" "}
          <span className="font-medium text-gray-700">
            Distribuidora Lima SAC
          </span>{" "}
          — Carga del 28/04/2026
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Procesados"
          value={sampleUploadRows.length}
          icon={<Package className="h-6 w-6 text-blue-600" />}
          accentBg="bg-blue-100"
          accentText="text-blue-700"
        />
        <SummaryCard
          label="Nuevos"
          value={newRows.length}
          icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          accentBg="bg-green-100"
          accentText="text-green-700"
        />
        <SummaryCard
          label="Duplicados Detectados"
          value={duplicateRows.length}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          accentBg="bg-red-100"
          accentText="text-red-700"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
              >
                {tab.label}
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${isActive
                    ? "bg-brand-100 text-brand-700"
                    : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "new" && (
          <NuevosTab
            rows={newRows}
            confirmedIds={confirmedIds}
            rejectedIds={rejectedIds}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onConfirmAll={handleConfirmAll}
            onRejectAll={handleRejectAll}
          />
        )}
        {activeTab === "duplicate" && (
          <DuplicadosTab
            rows={duplicateRows}
            resolutions={dupResolutions}
            mergedProducts={mergedProducts}
            onMerge={handleMerge}
            onKeepBoth={handleKeepBoth}
            onReject={handleRejectDuplicate}
            onUndo={handleUndoDuplicate}
          />
        )}
        {activeTab === "error" && (
          <ErroresTab
            rows={errorRows}
            corrections={errorCorrections}
            onCorrect={handleErrorCorrect}
          />
        )}
      </div>

      {/* Bottom sticky bar */}
      <div className="fixed bottom-0 left-64 right-0 z-40 border-t border-gray-200 bg-white/95 px-8 py-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50">
              <CheckCircle className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {confirmedCount} de {totalActionable} confirmados
                {resolvedDupCount > 0 && (
                  <span className="ml-1.5 text-xs font-normal text-gray-500">
                    ({resolvedDupCount} fusionado{resolvedDupCount > 1 ? "s" : ""})
                  </span>
                )}
              </p>
              <div className="mt-0.5 h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{
                    width: `${totalActionable > 0
                      ? (confirmedCount / totalActionable) * 100
                      : 0
                      }%`,
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={confirmedCount === 0}
            onClick={() => router.push("/exportar")}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-700 hover:shadow-brand-600/50 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            Confirmar Lote
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
