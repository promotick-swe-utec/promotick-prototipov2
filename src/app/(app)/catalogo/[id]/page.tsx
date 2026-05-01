import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Star,
  Calendar,
  Package,
  Ruler,
  Weight,
  DollarSign,
  Tag,
  Barcode,
  Layers,
  Truck,
  Info,
} from "lucide-react";
import { products, productPrices, type Product, type ProductPrice } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function fmtPrice(n: number): string {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: Product["status"]): { text: string; classes: string } {
  switch (status) {
    case "active":
      return {
        text: "Activo",
        classes: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
      };
    case "inactive":
      return {
        text: "Inactivo",
        classes: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
      };
    case "draft":
      return {
        text: "Borrador",
        classes: "bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20",
      };
    case "pending_confirmation":
      return {
        text: "Pendiente",
        classes: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
      };
  }
}

function priceStatusBadge(pp: ProductPrice): { text: string; classes: string } {
  if (pp.isCurrent && pp.isOfficial) {
    return {
      text: "Vigente / Oficial",
      classes: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20",
    };
  }
  if (pp.isCurrent) {
    return {
      text: "Vigente",
      classes: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
    };
  }
  return {
    text: "Vencido",
    classes: "bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-300/40",
  };
}

/* ------------------------------------------------------------------ */
/*  Info item component                                                */
/* ------------------------------------------------------------------ */
function InfoItem({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <dl>
      <dt className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
        {icon}
        {label}
      </dt>
      <dd
        className={`text-sm font-medium text-gray-900 ${mono ? "font-mono" : ""}`}
      >
        {value || "--"}
      </dd>
    </dl>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  const product = products.find((p) => p.id === productId);

  /* ── Not found ── */
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Package className="mb-4 h-16 w-16 text-gray-300" />
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          Producto no encontrado
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          El producto con ID "{id}" no existe en el catálogo.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  const badge = statusLabel(product.status);
  const prices: ProductPrice[] = productPrices[product.id] ?? [];

  return (
    <div>
      {/* ── Breadcrumb + actions ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/catalogo"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            title="Volver al catálogo"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link
              href="/catalogo"
              className="transition-colors hover:text-brand-600"
            >
              Catálogo
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-medium text-gray-900">
              {product.displayName}
            </span>
          </nav>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
      </div>

      {/* ── Product header card ── */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {product.displayName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md bg-brand-50 px-2.5 py-1 font-mono text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20">
                {product.netsuiteCode}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.classes}`}
              >
                {badge.text}
              </span>
            </div>
          </div>
        </div>

        {/* Quick info grid */}
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-4">
          <InfoItem
            label="SKU"
            value={product.sku}
            icon={<Tag className="h-3 w-3" />}
            mono
          />
          <InfoItem
            label="EAN"
            value={product.ean}
            icon={<Barcode className="h-3 w-3" />}
            mono
          />
          <InfoItem
            label="Marca"
            value={product.brand}
            icon={<Layers className="h-3 w-3" />}
          />
          <InfoItem
            label="Modelo"
            value={product.model}
            icon={<Package className="h-3 w-3" />}
          />
        </dl>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left column (wider) ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informacion del Producto */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Info className="h-4 w-4 text-gray-400" />
              Información del Producto
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              <InfoItem label="Nombre interno" value={product.name} />
              <InfoItem label="Nombre comercial" value={product.displayName} />
              <InfoItem label="Marca" value={product.brand} />
              <InfoItem label="Modelo" value={product.model} />
              <InfoItem label="Categoría" value={product.categoryName} />
              <InfoItem
                label="Subcategoría"
                value={product.subcategoryName}
              />
              <InfoItem label="SKU" value={product.sku} mono />
              <InfoItem label="EAN" value={product.ean} mono />
            </dl>
          </div>

          {/* Dimensiones y Peso */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Ruler className="h-4 w-4 text-gray-400" />
              Dimensiones y Peso
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              <InfoItem
                label="Peso"
                value={
                  product.weightKg !== null ? `${product.weightKg} kg` : null
                }
                icon={<Weight className="h-3 w-3" />}
              />
              <InfoItem
                label="Largo"
                value={
                  product.lengthCm !== null ? `${product.lengthCm} cm` : null
                }
                icon={<Ruler className="h-3 w-3" />}
              />
              <InfoItem
                label="Ancho"
                value={
                  product.widthCm !== null ? `${product.widthCm} cm` : null
                }
                icon={<Ruler className="h-3 w-3" />}
              />
              <InfoItem
                label="Alto"
                value={
                  product.heightCm !== null ? `${product.heightCm} cm` : null
                }
                icon={<Ruler className="h-3 w-3" />}
              />
            </dl>
          </div>

          {/* Proveedor Preferido */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Truck className="h-4 w-4 text-gray-400" />
              Proveedor Preferido
            </h2>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <InfoItem
                label="Proveedor"
                value={product.preferredSupplier}
              />
              <InfoItem
                label="Última actualización de precio"
                value={fmtDate(product.lastPriceUpdate)}
                icon={<Calendar className="h-3 w-3" />}
              />
            </dl>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          {/* Precio Oficial */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <DollarSign className="h-4 w-4 text-gray-400" />
              Precio Oficial
            </h2>
            <p className="text-3xl font-bold text-brand-600">
              {fmtPrice(product.officialPrice)}
            </p>
            <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
              <p className="flex items-center gap-1.5 text-sm text-gray-600">
                <Truck className="h-3.5 w-3.5 text-gray-400" />
                {product.preferredSupplier}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
                {fmtDate(product.lastPriceUpdate)}
              </p>
            </div>
          </div>

          {/* Historial de Precios */}
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <DollarSign className="h-4 w-4 text-gray-400" />
              Historial de Precios
            </h2>

            {prices.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <DollarSign className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">Sin historial de precios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="pb-3 pr-2">Proveedor</th>
                      <th className="pb-3 pr-2 text-right">Precio</th>
                      <th className="pb-3 pr-2 text-right">c/IGV</th>
                      <th className="pb-3 pr-2">Vigencia</th>
                      <th className="pb-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {prices.map((pp) => {
                      const ppBadge = priceStatusBadge(pp);
                      return (
                        <tr
                          key={pp.id}
                          className={`transition-colors ${
                            pp.isCurrent
                              ? "bg-brand-50/40"
                              : "hover:bg-gray-50/60"
                          }`}
                        >
                          <td className="py-3 pr-2">
                            <div className="flex items-center gap-1">
                              {pp.isOfficial && (
                                <Star className="h-3 w-3 flex-shrink-0 fill-amber-400 text-amber-400" />
                              )}
                              <span className="text-gray-700">
                                {pp.supplierName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-2 text-right font-medium text-gray-900">
                            {fmtPrice(pp.price)}
                          </td>
                          <td className="py-3 pr-2 text-right text-gray-500">
                            {fmtPrice(pp.priceWithTax)}
                          </td>
                          <td className="py-3 pr-2 text-xs text-gray-500">
                            <span>{fmtDate(pp.validFrom)}</span>
                            <span className="mx-1 text-gray-300">-</span>
                            <span>
                              {pp.validTo ? fmtDate(pp.validTo) : "Vigente"}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${ppBadge.classes}`}
                            >
                              {ppBadge.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
