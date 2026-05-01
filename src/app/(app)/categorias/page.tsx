"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  FolderTree,
  Folder,
  FolderOpen,
  Hash,
  Pencil,
} from "lucide-react";
import { categories, type Category, type Subcategory } from "@/lib/mock-data";

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
/*  Subcategory row                                                    */
/* ------------------------------------------------------------------ */
function SubcategoryRow({
  sub,
  categoryCode,
}: {
  sub: Subcategory;
  categoryCode: string;
}) {
  const netsuitePrefix = `NS-${categoryCode}-${sub.code}-####`;

  return (
    <div className="group flex items-center gap-4 border-t border-gray-100 py-3 pl-12 pr-5 transition-colors hover:bg-gray-50/60">
      {/* Icon + name */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
          <Hash className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {sub.name}
          </p>
          <p className="text-xs text-gray-400">{sub.description}</p>
        </div>
      </div>

      {/* Code badge */}
      <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        {sub.code}
      </span>

      {/* NetSuite prefix */}
      <span className="hidden shrink-0 font-mono text-xs text-gray-400 sm:inline">
        {netsuitePrefix}
      </span>

      {/* Sequence counter */}
      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        <span className="text-xs text-gray-400">Secuencia:</span>
        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
          {sub.currentSequence.toLocaleString("es-PE")}
        </span>
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge active={sub.isActive} />
      </div>

      {/* Edit action */}
      <button
        type="button"
        title="Editar subcategoría"
        className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition-all hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Category accordion card                                            */
/* ------------------------------------------------------------------ */
function CategoryCard({
  category,
  isOpen,
  onToggle,
}: {
  category: Category;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      {/* ── Header row ── */}
      <div className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <div
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 transition-colors hover:bg-gray-50/60 rounded-lg -m-2 p-2"
        >
          {/* Expand/collapse chevron */}
          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
            {isOpen ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Folder icon */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              isOpen
                ? "bg-brand-50 text-brand-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {isOpen ? (
              <FolderOpen className="h-5 w-5" />
            ) : (
              <Folder className="h-5 w-5" />
            )}
          </div>

          {/* Name + description */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                {category.name}
              </span>
              <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold tracking-wide text-brand-700">
                {category.code}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-gray-500">
              {category.description}
            </p>
          </div>

          {/* Subcategory count */}
          <span className="hidden shrink-0 text-sm text-gray-400 sm:inline">
            {category.subcategories.length}{" "}
            {category.subcategories.length === 1
              ? "subcategor\u00eda"
              : "subcategor\u00edas"}
          </span>

          {/* Status */}
          <div className="shrink-0">
            <StatusBadge active={category.isActive} />
          </div>
        </div>

        {/* Edit button (outside interactive container to avoid nesting) */}
        <button
          type="button"
          title="Editar categoría"
          className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {/* ── Expanded subcategories ── */}
      {isOpen && (
        <div className="border-t border-gray-100">
          {category.subcategories.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              No hay subcategorías registradas.
            </p>
          ) : (
            category.subcategories.map((sub) => (
              <SubcategoryRow
                key={sub.id}
                sub={sub}
                categoryCode={category.code}
              />
            ))
          )}

          {/* New subcategory button */}
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva Subcategoría
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function CategoriasPage() {
  // Track which categories are expanded; default: first one open
  const [openIds, setOpenIds] = useState<Set<number>>(
    () => new Set([categories[0]?.id]),
  );

  function toggle(id: number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <FolderTree className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Categorías y Subcategorías
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Estructura jerárquica del catálogo maestro de productos
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </button>
      </div>

      {/* ── Summary bar ── */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white px-5 py-3.5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Total categorías:</span>
          <span className="font-semibold text-gray-900">
            {categories.length}
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Total subcategorías:</span>
          <span className="font-semibold text-gray-900">
            {categories.reduce((acc, c) => acc + c.subcategories.length, 0)}
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Activas:</span>
          <span className="font-semibold text-green-700">
            {categories.filter((c) => c.isActive).length} / {categories.length}
          </span>
        </div>
      </div>

      {/* ── Category accordion list ── */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            isOpen={openIds.has(cat.id)}
            onToggle={() => toggle(cat.id)}
          />
        ))}
      </div>
    </div>
  );
}
