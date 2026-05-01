"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  Pencil,
  ToggleLeft,
  Download,
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  ToggleRight,
} from "lucide-react";
import { products, categories, productPrices, type Product } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const ITEMS_PER_PAGE = 6;

type StatusFilter = "all" | "active" | "draft" | "inactive" | "pending_confirmation";

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "draft", label: "Borrador" },
  { value: "inactive", label: "Inactivo" },
  { value: "pending_confirmation", label: "Pendiente" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtPrice(n: number): string {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusLabel(status: Product["status"]): { text: string; classes: string } {
  switch (status) {
    case "active":
      return {
        text: "Activo",
        classes:
          "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
      };
    case "inactive":
      return {
        text: "Inactivo",
        classes:
          "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
      };
    case "draft":
      return {
        text: "Borrador",
        classes:
          "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
      };
    case "pending_confirmation":
      return {
        text: "Pendiente",
        classes:
          "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function CatalogoPage() {
  const router = useRouter();

  /* ── State ── */
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [brandFilter, setBrandFilter] = useState("");
  const [page, setPage] = useState(1);
  const [productList, setProductList] = useState<Product[]>(products);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function handleToggleStatus(id: number, currentStatus: Product["status"]) {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setProductList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)),
    );
  }

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    let list: Product[] = [...productList];

    // Category
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryName === categoryFilter);
    }

    // Status
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Brand
    if (brandFilter.trim()) {
      const q = brandFilter.toLowerCase();
      list = list.filter((p) => p.brand.toLowerCase().includes(q));
    }

    // Search (SKU, EAN, name, netsuite code)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.sku.toLowerCase().includes(q) ||
          (p.ean && p.ean.includes(q)) ||
          p.name.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q) ||
          p.netsuiteCode.toLowerCase().includes(q),
      );
    }

    return list;
  }, [search, categoryFilter, statusFilter, brandFilter, productList]);

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  /* Reset page when filters change */
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleCategory = (v: string) => { setCategoryFilter(v); setPage(1); };
  const handleStatus = (v: StatusFilter) => { setStatusFilter(v); setPage(1); };
  const handleBrand = (v: string) => { setBrandFilter(v); setPage(1); };

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Catálogo de Productos
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona y consulta todos los productos del catálogo maestro
          </p>
        </div>
      </div>

      {/* ── Search + Filters card ── */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por SKU, EAN, nombre o código NetSuite..."
            className="w-full rounded-lg border border-gray-200 bg-surface py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtros:</span>
          </div>

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => handleCategory(e.target.value)}
            aria-label="Filtrar por categoría"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatus(e.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {statusFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Brand text filter */}
          <input
            type="text"
            value={brandFilter}
            onChange={(e) => handleBrand(e.target.value)}
            placeholder="Filtrar por marca..."
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* ── Results counter & Legend ── */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-gray-400" />
          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-semibold text-gray-900">{paginated.length}</span>{" "}
            de{" "}
            <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
            productos
          </p>
        </div>
        
        {/* Leyenda de Estados */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs shadow-sm">
          <span className="font-medium text-gray-500">Leyenda:</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Activo</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> Inactivo</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500"></span> Borrador</span>
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Pendiente</span>
        </div>
      </div>

      {/* ── Data table card ── */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3.5 pl-6 pr-3">Código NS</th>
                <th className="px-3 py-3.5">SKU</th>
                <th className="px-3 py-3.5">Nombre</th>
                <th className="px-3 py-3.5">Categoría</th>
                <th className="px-3 py-3.5 text-right">Precio Oficial</th>
                <th className="px-3 py-3.5 text-center">Estado</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-sm text-gray-400"
                  >
                    <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    No se encontraron productos con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const badge = statusLabel(p.status);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/catalogo/${p.id}`)}
                      className="group cursor-pointer transition-colors hover:bg-gray-50/60"
                    >
                      {/* Codigo NS */}
                      <td className="py-4 pl-6 pr-3">
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium text-gray-700">
                          {p.netsuiteCode}
                        </span>
                      </td>

                      {/* SKU */}
                      <td className="px-3 py-4 text-gray-700">{p.sku}</td>

                      {/* Nombre */}
                      <td className="px-3 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.displayName}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {p.brand}
                          </p>
                        </div>
                      </td>

                      {/* Categoria > Subcategoria */}
                      <td className="px-3 py-4 text-gray-600">
                        <span>{p.categoryName}</span>
                        <span className="mx-1 text-gray-300">&gt;</span>
                        <span className="text-gray-500">{p.subcategoryName}</span>
                      </td>

                      {/* Precio */}
                      <td className="px-3 py-4 text-right font-semibold text-gray-900">
                        {fmtPrice(p.officialPrice)}
                      </td>

                      {/* Estado */}
                      <td className="px-3 py-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
                        >
                          {badge.text}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="py-4 pl-3 pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/catalogo/${p.id}`}
                            onClick={(e) => e.stopPropagation()}
                            title="Ver detalle"
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProduct(p);
                            }}
                            title="Editar"
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(p.id, p.status);
                            }}
                            title={p.status === "active" ? "Desactivar" : "Activar"}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                              p.status === "active"
                                ? "text-brand-500 hover:bg-brand-50 hover:text-brand-700"
                                : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            }`}
                          >
                            {p.status === "active" ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3.5">
          <p className="text-sm text-gray-500">
            Página{" "}
            <span className="font-medium text-gray-900">{safePage}</span> de{" "}
            <span className="font-medium text-gray-900">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>

            {/* Page number pills */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`hidden h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors sm:inline-flex ${
                  n === safePage
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Editar Producto</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del producto</label>
                <input
                  type="text"
                  defaultValue={editingProduct.displayName}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Precio Oficial (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct.officialPrice}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
