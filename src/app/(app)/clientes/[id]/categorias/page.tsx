"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Sparkles,
  Save,
  FolderTree,
} from "lucide-react";
import {
  clients,
  clientCategories,
  categories,
  type ClientCategory,
} from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Helper: build master options                                        */
/* ------------------------------------------------------------------ */
function getMasterCategories() {
  return categories.map((c) => c.name);
}

function getMasterSubcategories() {
  return categories.flatMap((c) =>
    c.subcategories.map((s) => ({ category: c.name, subcategory: s.name })),
  );
}

/* ------------------------------------------------------------------ */
/*  Mapping row                                                         */
/* ------------------------------------------------------------------ */
function MappingRow({ cat }: { cat: ClientCategory }) {
  const masterCats = getMasterCategories();
  const masterSubs = getMasterSubcategories();

  return (
    <tr className="group transition-colors hover:bg-gray-50/60">
      {/* Client category */}
      <td className="py-3.5 pl-6 pr-3">
        <div>
          <p className="font-medium text-gray-900">{cat.name}</p>
          <p className="text-xs text-gray-400">ID: {cat.externalId}</p>
        </div>
      </td>

      {/* Arrow */}
      <td className="px-3 py-3.5 text-center">
        <ArrowRight className="mx-auto h-4 w-4 text-gray-300" />
      </td>

      {/* Master category select */}
      <td className="px-3 py-3.5">
        <select
          defaultValue={cat.masterCategoryName || ""}
          aria-label={`Categoría maestra para ${cat.name}`}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="" disabled>
            Seleccionar...
          </option>
          {masterCats.map((mc) => (
            <option key={mc} value={mc}>
              {mc}
            </option>
          ))}
        </select>
      </td>

      {/* Master subcategory select */}
      <td className="px-3 py-3.5 pr-6">
        <select
          defaultValue={cat.masterSubcategoryName || ""}
          aria-label={`Subcategoría maestra para ${cat.name}`}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="" disabled>
            Seleccionar...
          </option>
          {masterSubs.map((ms) => (
            <option
              key={`${ms.category}-${ms.subcategory}`}
              value={ms.subcategory}
            >
              {ms.category} &rarr; {ms.subcategory}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */
export default function ClientCategoriasPage() {
  const params = useParams();
  const clientId = Number(params.id);
  const client = clients.find((c) => c.id === clientId);

  const filteredCategories = useMemo(
    () => clientCategories.filter((cc) => cc.clientId === clientId),
    [clientId],
  );

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
            Mapeo de Categorías
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
                <FolderTree className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Mapeo de Categorías
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  {client.name} — {filteredCategories.length} categorías
                  del cliente
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -- Two-panel layout -- */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Categories list (2/3) */}
        <div className="lg:col-span-2">
          {/* Client categories summary */}
          <div className="mb-4 rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Categorías del Cliente
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Mapea cada categoría del cliente a la estructura maestra de Promotick
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="py-3 pl-6 pr-3">ID Externo</th>
                    <th className="px-3 py-3">Nombre</th>
                    <th className="px-3 py-3">
                      Cat. Maestra
                    </th>
                    <th className="px-3 py-3 pr-6">Subcat. Maestra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCategories.map((cc) => (
                    <tr
                      key={cc.id}
                      className="transition-colors hover:bg-gray-50/60"
                    >
                      <td className="py-3 pl-6 pr-3">
                        <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {cc.externalId}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900">
                        {cc.name}
                      </td>
                      <td className="px-3 py-3">
                        {cc.masterCategoryName ? (
                          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                            {cc.masterCategoryName}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Sin mapear
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 pr-6">
                        {cc.masterSubcategoryName ? (
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            {cc.masterSubcategoryName}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Sin mapear
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mapping table */}
          <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                Tabla de Mapeo
              </h2>
              <p className="mt-0.5 text-sm text-gray-500">
                Asigna las categorías y subcategorías maestras
                correspondientes
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="py-3 pl-6 pr-3">
                      Categoría Cliente
                    </th>
                    <th className="w-12 px-3 py-3 text-center">&nbsp;</th>
                    <th className="px-3 py-3">
                      Categoría Maestra
                    </th>
                    <th className="px-3 py-3 pr-6">
                      Subcategoría Maestra
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCategories.map((cc) => (
                    <MappingRow key={cc.id} cat={cc} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Action panel (1/3) */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {/* Actions card */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Acciones
              </h3>

              <div className="space-y-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  Cargar Árbol desde Excel
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Sugerir Mapeo con IA
                </button>

                <div className="my-2 border-t border-gray-100" />

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                >
                  <Save className="h-4 w-4" />
                  Guardar Mapeo
                </button>
              </div>
            </div>

            {/* Stats card */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Resumen
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total categorías</span>
                  <span className="font-semibold text-gray-900">
                    {filteredCategories.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Mapeadas</span>
                  <span className="font-semibold text-green-700">
                    {
                      filteredCategories.filter(
                        (c) => c.masterCategoryName !== null,
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Sin mapear</span>
                  <span className="font-semibold text-amber-600">
                    {
                      filteredCategories.filter(
                        (c) => c.masterCategoryName === null,
                      ).length
                    }
                  </span>
                </div>
                {/* Progress bar */}
                <div className="pt-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-brand-500 transition-all"
                      style={{
                        width: `${
                          filteredCategories.length > 0
                            ? (filteredCategories.filter(
                                (c) => c.masterCategoryName !== null,
                              ).length /
                                filteredCategories.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    {filteredCategories.length > 0
                      ? Math.round(
                          (filteredCategories.filter(
                            (c) => c.masterCategoryName !== null,
                          ).length /
                            filteredCategories.length) *
                            100,
                        )
                      : 0}
                    % completado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
