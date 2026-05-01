"use client";

import { useState, useMemo, Fragment } from "react";
import {
  Search,
  Plus,
  Star,
  Pencil,
  FileText,
  ToggleLeft,
  ToggleRight,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { suppliers, products, type Supplier } from "@/lib/mock-data";
import Link from "next/link";

type StatusFilter = "all" | "active" | "inactive" | "preferred";
type SortConfig = { key: "cargas" | "ultimaCarga" | "estado"; direction: "asc" | "desc" } | null;

/* ------------------------------------------------------------------ */
/*  Helper: format date to locale                                      */
/* ------------------------------------------------------------------ */
function fmtDate(iso: string | null): string {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
      Inactivo
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Preferred badge                                                    */
/* ------------------------------------------------------------------ */
function PreferredBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/20"
      title="Proveedor preferido"
    >
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      Preferido
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function ProveedoresPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [openSupplierId, setOpenSupplierId] = useState<number | null>(null);
  const [list, setList] = useState<Supplier[]>(suppliers);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  function handleSort(key: "cargas" | "ultimaCarga" | "estado") {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: "cargas" | "ultimaCarga" | "estado") => {
    if (sortConfig?.key !== key) return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-300 transition-colors group-hover:text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-brand-600" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-brand-600" />
    );
  };

  function handleToggleActive(id: number) {
    setList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  }

  function openEdit(s: Supplier) {
    setEditingSupplier(s);
    setIsFormOpen(true);
  }

  function openNew() {
    setEditingSupplier(null);
    setIsFormOpen(true);
  }

  /* Derived filtered list */
  const filtered = useMemo(() => {
    let current = [...list];

    // Status filter
    if (statusFilter === "active") current = current.filter((s) => s.isActive);
    if (statusFilter === "inactive") current = current.filter((s) => !s.isActive);
    if (statusFilter === "preferred") current = current.filter((s) => s.preferred);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      current = current.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ruc.includes(q) ||
          s.contactEmail.toLowerCase().includes(q),
      );
    }

    // Sort
    if (sortConfig) {
      current.sort((a, b) => {
        if (sortConfig.key === "cargas") {
          return sortConfig.direction === "asc"
            ? a.uploadsCount - b.uploadsCount
            : b.uploadsCount - a.uploadsCount;
        }
        if (sortConfig.key === "ultimaCarga") {
          const da = a.lastUpload ? new Date(a.lastUpload).getTime() : 0;
          const db = b.lastUpload ? new Date(b.lastUpload).getTime() : 0;
          return sortConfig.direction === "asc" ? da - db : db - da;
        }
        if (sortConfig.key === "estado") {
          const vA = a.isActive ? 1 : 0;
          const vB = b.isActive ? 1 : 0;
          return sortConfig.direction === "asc" ? vB - vA : vA - vB;
        }
        return 0;
      });
    }

    return current;
  }, [search, statusFilter, sortConfig, list]);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Proveedores
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los proveedores registrados y su actividad de cargas
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* ── Search + filters card ── */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por razón social, RUC o email..."
              className="w-full rounded-lg border border-gray-200 bg-surface py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Mostrar:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="preferred">Preferidos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Data table card ── */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3.5 pl-6 pr-3">Razón Social</th>
                <th className="px-3 py-3.5">RUC</th>
                <th className="px-3 py-3.5">Email</th>
                <th 
                  className="group cursor-pointer select-none px-3 py-3.5 text-center transition-colors hover:bg-gray-100 focus:outline-none"
                  onClick={() => handleSort("cargas")}
                >
                  <div className="flex items-center justify-center">
                    Cargas {getSortIcon("cargas")}
                  </div>
                </th>
                <th 
                  className="group cursor-pointer select-none px-3 py-3.5 transition-colors hover:bg-gray-100 focus:outline-none"
                  onClick={() => handleSort("ultimaCarga")}
                >
                  <div className="flex items-center">
                    Última Carga {getSortIcon("ultimaCarga")}
                  </div>
                </th>
                <th 
                  className="group cursor-pointer select-none px-3 py-3.5 text-center transition-colors hover:bg-gray-100 focus:outline-none"
                  onClick={() => handleSort("estado")}
                >
                  <div className="flex items-center justify-center">
                    Estado {getSortIcon("estado")}
                  </div>
                </th>
                <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    No se encontraron proveedores con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <Fragment key={s.id}>
                    <tr
                      className="group transition-colors hover:bg-gray-50/60"
                    >
                      {/* Name + preferred badge */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {s.name}
                          </span>
                          {s.preferred && <PreferredBadge />}
                        </div>
                      </td>

                      {/* RUC */}
                      <td className="px-3 py-4 font-mono text-xs text-gray-600">
                        {s.ruc}
                      </td>

                      {/* Email */}
                      <td className="px-3 py-4 text-gray-600">
                        {s.contactEmail}
                      </td>

                      {/* Uploads count */}
                      <td className="px-3 py-4 text-center font-semibold text-gray-900">
                        {s.uploadsCount}
                      </td>

                      {/* Last upload */}
                      <td className="px-3 py-4 text-gray-500">
                        {fmtDate(s.lastUpload)}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4 text-center">
                        <StatusBadge active={s.isActive} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            title="Editar proveedor"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/proveedores/${s.id}/cargas`}
                            title="Ver historial de cargas"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <FileText className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(s.id)}
                            title={
                              s.isActive
                                ? "Desactivar proveedor"
                                : "Activar proveedor"
                            }
                            className={`rounded-lg p-2 transition-colors ${s.isActive
                              ? "text-brand-500 hover:bg-brand-50 hover:text-brand-700"
                              : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              }`}
                          >
                            {s.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenSupplierId(openSupplierId === s.id ? null : s.id)}
                            title="Ver información adicional"
                            className={`ml-1 rounded-lg p-2 transition-colors ${openSupplierId === s.id
                              ? "text-brand-600 bg-brand-50"
                              : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              }`}
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {openSupplierId === s.id && (
                      <tr key={`details-${s.id}`} className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-3 text-sm text-gray-700">
                          <div className="grid gap-4 sm:flex sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-xs text-gray-500">Contacto</p>
                                <p className="font-medium text-gray-900">{s.contactPhone ?? "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{s.contactEmail ?? "-"}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Categorías de productos</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Array.from(new Set(products.filter(p => p.preferredSupplier === s.name).map(p => p.categoryName))).length === 0 ? (
                                  <span className="text-sm text-gray-400">No especificado</span>
                                ) : (
                                  Array.from(new Set(products.filter(p => p.preferredSupplier === s.name).map(p => p.categoryName))).map((cat) => (
                                    <span key={cat} className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">{cat}</span>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table footer / pagination info ── */}
        <div className="border-t border-gray-100 px-6 py-3.5">
          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-medium text-gray-900">
              1-{filtered.length}
            </span>{" "}
            de{" "}
            <span className="font-medium text-gray-900">
              {filtered.length}
            </span>{" "}
            proveedores
          </p>
        </div>
      </div>

      {/* Form Modal (Crear / Editar) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {editingSupplier ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Razón Social</label>
                <input
                  type="text"
                  defaultValue={editingSupplier?.name || ""}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">RUC</label>
                <input
                  type="text"
                  defaultValue={editingSupplier?.ruc || ""}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  defaultValue={editingSupplier?.contactEmail || ""}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
