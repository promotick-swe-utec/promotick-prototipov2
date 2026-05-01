"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  FolderTree,
  Folder,
  FolderOpen,
  Hash,
  Pencil,
  Search,
} from "lucide-react";
import { categories, type Category, type Subcategory } from "@/lib/mock-data";

type CategoryFormState = {
  code: string;
  name: string;
  description: string;
  isActive: boolean;
};

type SubcategoryFormState = {
  code: string;
  name: string;
  description: string;
  currentSequence: string;
  isActive: boolean;
};

function createEmptyCategoryForm(): CategoryFormState {
  return {
    code: "",
    name: "",
    description: "",
    isActive: true,
  };
}

function createEmptySubcategoryForm(): SubcategoryFormState {
  return {
    code: "",
    name: "",
    description: "",
    currentSequence: "0",
    isActive: true,
  };
}

function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

function matchesText(source: string, query: string): boolean {
  return source.toLowerCase().includes(query);
}

function filterCategoriesByQuery(categoriesList: Category[], query: string): Category[] {
  if (!query) return categoriesList;

  return categoriesList
    .map((category) => {
      const categoryMatches = [category.code, category.name, category.description].some((field) =>
        matchesText(field, query),
      );
      const matchingSubcategories = category.subcategories.filter((sub) =>
        [sub.code, sub.name, sub.description].some((field) => matchesText(field, query)),
      );

      if (!categoryMatches && matchingSubcategories.length === 0) return null;

      return {
        ...category,
        subcategories: categoryMatches ? category.subcategories : matchingSubcategories,
      };
    })
    .filter((category): category is Category => category !== null);
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
/*  Subcategory row                                                    */
/* ------------------------------------------------------------------ */
function SubcategoryRow({
  sub,
  categoryCode,
  onEdit,
}: {
  sub: Subcategory;
  categoryCode: string;
  onEdit: (sub: Subcategory) => void;
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
        onClick={() => onEdit(sub)}
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
  onEditCategory,
  onEditSubcategory,
  onCreateSubcategory,
}: {
  category: Category;
  isOpen: boolean;
  onToggle: () => void;
  onEditCategory: (category: Category) => void;
  onEditSubcategory: (subcategory: Subcategory) => void;
  onCreateSubcategory: (category: Category) => void;
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
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isOpen
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
          onClick={() => onEditCategory(category)}
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
                onEdit={onEditSubcategory}
              />
            ))
          )}

          {/* New subcategory button */}
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={() => onCreateSubcategory(category)}
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
  const [categoryList, setCategoryList] = useState<Category[]>(categories);
  const [searchTerm, setSearchTerm] = useState("");

  // Track which categories are expanded; default: first one open
  const [openIds, setOpenIds] = useState<Set<number>>(
    () => new Set([categories[0]?.id]),
  );

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [createCategoryForm, setCreateCategoryForm] = useState<CategoryFormState>(createEmptyCategoryForm());
  const [createCategoryErrors, setCreateCategoryErrors] = useState<Record<string, string>>({});

  const [isCreatingSubcategory, setIsCreatingSubcategory] = useState(false);
  const [createSubcategoryCategoryId, setCreateSubcategoryCategoryId] = useState<number | null>(null);
  const [createSubcategoryForm, setCreateSubcategoryForm] = useState<SubcategoryFormState>(createEmptySubcategoryForm());
  const [createSubcategoryErrors, setCreateSubcategoryErrors] = useState<Record<string, string>>({});

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState<CategoryFormState>(createEmptyCategoryForm());
  const [editCategoryErrors, setEditCategoryErrors] = useState<Record<string, string>>({});

  const [editingSubcategoryContext, setEditingSubcategoryContext] = useState<{
    categoryId: number;
    subcategoryId: number;
  } | null>(null);
  const [editSubcategoryForm, setEditSubcategoryForm] = useState<SubcategoryFormState>(createEmptySubcategoryForm());
  const [editSubcategoryErrors, setEditSubcategoryErrors] = useState<Record<string, string>>({});

  const normalizedSearch = useMemo(() => normalizeQuery(searchTerm), [searchTerm]);
  const visibleCategories = useMemo(
    () => filterCategoriesByQuery(categoryList, normalizedSearch),
    [categoryList, normalizedSearch],
  );
  const isSearching = normalizedSearch.length > 0;

  function toggle(id: number) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetCreateCategoryForm() {
    setCreateCategoryForm(createEmptyCategoryForm());
    setCreateCategoryErrors({});
  }

  function resetCreateSubcategoryForm() {
    setCreateSubcategoryCategoryId(null);
    setCreateSubcategoryForm(createEmptySubcategoryForm());
    setCreateSubcategoryErrors({});
  }

  function resetEditCategoryForm() {
    setEditingCategoryId(null);
    setEditCategoryForm(createEmptyCategoryForm());
    setEditCategoryErrors({});
  }

  function resetEditSubcategoryForm() {
    setEditingSubcategoryContext(null);
    setEditSubcategoryForm(createEmptySubcategoryForm());
    setEditSubcategoryErrors({});
  }

  function openCreateCategoryModal() {
    resetCreateCategoryForm();
    setIsCreatingCategory(true);
  }

  function openCreateSubcategoryModal(category: Category) {
    setCreateSubcategoryCategoryId(category.id);
    setCreateSubcategoryForm(createEmptySubcategoryForm());
    setCreateSubcategoryErrors({});
    setIsCreatingSubcategory(true);
  }

  function openEditCategoryModal(category: Category) {
    setEditingCategoryId(category.id);
    setEditCategoryForm({
      code: category.code,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setEditCategoryErrors({});
  }

  function openEditSubcategoryModal(category: Category, subcategory: Subcategory) {
    setEditingSubcategoryContext({
      categoryId: category.id,
      subcategoryId: subcategory.id,
    });
    setEditSubcategoryForm({
      code: subcategory.code,
      name: subcategory.name,
      description: subcategory.description,
      currentSequence: String(subcategory.currentSequence),
      isActive: subcategory.isActive,
    });
    setEditSubcategoryErrors({});
  }

  function handleCreateCategory(e: any) {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const code = createCategoryForm.code.trim();
    const name = createCategoryForm.name.trim();
    const description = createCategoryForm.description.trim();

    if (!code) errors.code = "El código es requerido";
    if (code && !/^[A-Za-z]{2}$/.test(code)) errors.code = "El código debe tener 2 letras";
    if (!name) errors.name = "El nombre es requerido";
    if (!description) errors.description = "La descripción es requerida";
    if (categoryList.some((category) => category.code.toLowerCase() === code.toLowerCase())) {
      errors.code = "Ya existe una categoría con ese código";
    }

    if (Object.keys(errors).length > 0) {
      setCreateCategoryErrors(errors);
      return;
    }

    const nextId = Math.max(0, ...categoryList.map((category) => category.id)) + 1;
    const newCategory: Category = {
      id: nextId,
      code,
      name,
      description,
      isActive: createCategoryForm.isActive,
      subcategories: [],
    };

    setCategoryList((prev) => [newCategory, ...prev]);
    setOpenIds((prev) => new Set(prev).add(nextId));
    setIsCreatingCategory(false);
    resetCreateCategoryForm();
  }

  function handleCreateSubcategory(e: any) {
    e.preventDefault();

    const errors: Record<string, string> = {};
    const code = createSubcategoryForm.code.trim();
    const name = createSubcategoryForm.name.trim();
    const description = createSubcategoryForm.description.trim();
    const parentCategory = categoryList.find((category) => category.id === createSubcategoryCategoryId);

    if (!parentCategory) {
      errors.categoryId = "Selecciona una categoría padre válida";
    } else {
      if (!name) errors.name = "El nombre es requerido";
      if (!code) errors.code = "El código es requerido";
      if (code && !/^\d{2,}$/.test(code)) errors.code = "El código debe tener 2 o más dígitos";
      if (!description) errors.description = "La descripción es requerida";
    }

    if (Object.keys(errors).length > 0 || !parentCategory) {
      setCreateSubcategoryErrors(errors);
      return;
    }

    const nextId = Math.max(0, ...categoryList.flatMap((category) => category.subcategories.map((sub) => sub.id))) + 1;
    const nextSequence = Math.max(0, ...parentCategory.subcategories.map((sub) => sub.currentSequence)) + 1;
    const newSubcategory: Subcategory = {
      id: nextId,
      categoryId: parentCategory.id,
      code,
      name,
      description,
      currentSequence: nextSequence,
      isActive: createSubcategoryForm.isActive,
    };

    setCategoryList((prev) =>
      prev.map((category) =>
        category.id === parentCategory.id
          ? { ...category, subcategories: [...category.subcategories, newSubcategory] }
          : category,
      ),
    );
    setOpenIds((prev) => new Set(prev).add(parentCategory.id));
    setIsCreatingSubcategory(false);
    resetCreateSubcategoryForm();
  }

  function handleUpdateCategory(e: any) {
    e.preventDefault();
    if (editingCategoryId == null) return;

    const errors: Record<string, string> = {};
    const code = editCategoryForm.code.trim();
    const name = editCategoryForm.name.trim();
    const description = editCategoryForm.description.trim();

    if (!code) errors.code = "El código es requerido";
    if (!name) errors.name = "El nombre es requerido";
    if (!description) errors.description = "La descripción es requerida";
    if (
      code &&
      categoryList.some(
        (category) => category.id !== editingCategoryId && category.code.toLowerCase() === code.toLowerCase(),
      )
    ) {
      errors.code = "Ya existe una categoría con ese código";
    }

    if (Object.keys(errors).length > 0) {
      setEditCategoryErrors(errors);
      return;
    }

    setCategoryList((prev) =>
      prev.map((category) =>
        category.id === editingCategoryId
          ? { ...category, code, name, description, isActive: editCategoryForm.isActive }
          : category,
      ),
    );

    resetEditCategoryForm();
  }

  function handleUpdateSubcategory(e: any) {
    e.preventDefault();
    if (!editingSubcategoryContext) return;

    const errors: Record<string, string> = {};
    const code = editSubcategoryForm.code.trim();
    const name = editSubcategoryForm.name.trim();
    const description = editSubcategoryForm.description.trim();
    const currentSequence = Number(editSubcategoryForm.currentSequence);

    if (!code) errors.code = "El código es requerido";
    if (!name) errors.name = "El nombre es requerido";
    if (!description) errors.description = "La descripción es requerida";
    if (!Number.isFinite(currentSequence) || currentSequence < 0) {
      errors.currentSequence = "La secuencia debe ser un número válido";
    }

    if (Object.keys(errors).length > 0) {
      setEditSubcategoryErrors(errors);
      return;
    }

    setCategoryList((prev) =>
      prev.map((category) => {
        if (category.id !== editingSubcategoryContext.categoryId) return category;

        return {
          ...category,
          subcategories: category.subcategories.map((subcategory) =>
            subcategory.id === editingSubcategoryContext.subcategoryId
              ? {
                ...subcategory,
                code,
                name,
                description,
                currentSequence,
                isActive: editSubcategoryForm.isActive,
              }
              : subcategory,
          ),
        };
      }),
    );

    resetEditSubcategoryForm();
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

        <div className="flex flex-col gap-3 sm:min-w-[420px] sm:items-end">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar categoría o subcategoría"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <button
            type="button"
            onClick={openCreateCategoryModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-white px-5 py-3.5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Total categorías:</span>
          <span className="font-semibold text-gray-900">
            {categoryList.length}
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Total subcategorías:</span>
          <span className="font-semibold text-gray-900">
            {categoryList.reduce((acc, c) => acc + c.subcategories.length, 0)}
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Activas:</span>
          <span className="font-semibold text-green-700">
            {categoryList.filter((c) => c.isActive).length} / {categoryList.length}
          </span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Resultados:</span>
          <span className="font-semibold text-gray-900">
            {visibleCategories.length}
          </span>
        </div>
      </div>

      {/* ── Category accordion list ── */}
      <div className="space-y-4">
        {visibleCategories.length === 0 ? (
          <div className="rounded-xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-black/5">
            <p className="text-sm font-medium text-gray-900">No se encontraron categorías</p>
            <p className="mt-1 text-sm text-gray-500">Prueba con otro nombre, código o descripción.</p>
          </div>
        ) : (
          visibleCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isOpen={isSearching || openIds.has(cat.id)}
              onToggle={() => {
                if (isSearching) return;
                toggle(cat.id);
              }}
              onEditCategory={openEditCategoryModal}
              onEditSubcategory={(sub) => openEditSubcategoryModal(cat, sub)}
              onCreateSubcategory={openCreateSubcategoryModal}
            />
          ))
        )}
      </div>

      {isCreatingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreateCategory} className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Nueva Categoría</h3>

            <div className="mb-3">
              <label htmlFor="create-category-name" className="block text-xs text-gray-600">Nombre</label>
              <input
                id="create-category-name"
                value={createCategoryForm.name}
                onChange={(e) => setCreateCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {createCategoryErrors.name && <p className="mt-1 text-xs text-red-600">{createCategoryErrors.name}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="create-category-code" className="block text-xs text-gray-600">Código (2 letras, ej: AL, EL)</label>
              <input
                id="create-category-code"
                value={createCategoryForm.code}
                maxLength={2}
                onChange={(e) => setCreateCategoryForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {createCategoryErrors.code && <p className="mt-1 text-xs text-red-600">{createCategoryErrors.code}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="create-category-description" className="block text-xs text-gray-600">Descripción</label>
              <textarea
                id="create-category-description"
                value={createCategoryForm.description}
                onChange={(e) => setCreateCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                rows={3}
              />
              {createCategoryErrors.description && <p className="mt-1 text-xs text-red-600">{createCategoryErrors.description}</p>}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createCategoryForm.isActive}
                  onChange={(e) => setCreateCategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Categoría activa</span>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCategory(false);
                  resetCreateCategoryForm();
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      {isCreatingSubcategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreateSubcategory} className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Nueva Subcategoría</h3>

            <div className="mb-3">
              <label htmlFor="create-subcategory-parent" className="block text-xs text-gray-600">Categoría padre</label>
              <input
                id="create-subcategory-parent"
                value={categoryList.find((category) => category.id === createSubcategoryCategoryId)?.name || ""}
                disabled
                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600 focus:outline-none"
              />
              {createSubcategoryErrors.categoryId && <p className="mt-1 text-xs text-red-600">{createSubcategoryErrors.categoryId}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="create-subcategory-name" className="block text-xs text-gray-600">Nombre</label>
              <input
                id="create-subcategory-name"
                value={createSubcategoryForm.name}
                onChange={(e) => setCreateSubcategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {createSubcategoryErrors.name && <p className="mt-1 text-xs text-red-600">{createSubcategoryErrors.name}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="create-subcategory-code" className="block text-xs text-gray-600">Código (2+ dígitos)</label>
              <input
                id="create-subcategory-code"
                value={createSubcategoryForm.code}
                onChange={(e) => setCreateSubcategoryForm((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, "") }))}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {createSubcategoryErrors.code && <p className="mt-1 text-xs text-red-600">{createSubcategoryErrors.code}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="create-subcategory-description" className="block text-xs text-gray-600">Descripción</label>
              <textarea
                id="create-subcategory-description"
                value={createSubcategoryForm.description}
                onChange={(e) => setCreateSubcategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                rows={3}
              />
              {createSubcategoryErrors.description && <p className="mt-1 text-xs text-red-600">{createSubcategoryErrors.description}</p>}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createSubcategoryForm.isActive}
                  onChange={(e) => setCreateSubcategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Estado activo</span>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingSubcategory(false);
                  resetCreateSubcategoryForm();
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      {editingCategoryId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleUpdateCategory} className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Editar Categoría</h3>

            <div className="mb-3">
              <label htmlFor="edit-category-name" className="block text-xs text-gray-600">Nombre</label>
              <input
                id="edit-category-name"
                value={editCategoryForm.name}
                onChange={(e) => setEditCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {editCategoryErrors.name && <p className="mt-1 text-xs text-red-600">{editCategoryErrors.name}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-category-code" className="block text-xs text-gray-600">Código (2 letras, ej: AL, EL)</label>
              <input
                id="edit-category-code"
                value={editCategoryForm.code}
                maxLength={2}
                onChange={(e) => setEditCategoryForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {editCategoryErrors.code && <p className="mt-1 text-xs text-red-600">{editCategoryErrors.code}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-category-description" className="block text-xs text-gray-600">Descripción</label>
              <textarea
                id="edit-category-description"
                value={editCategoryForm.description}
                onChange={(e) => setEditCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                rows={3}
              />
              {editCategoryErrors.description && <p className="mt-1 text-xs text-red-600">{editCategoryErrors.description}</p>}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editCategoryForm.isActive}
                  onChange={(e) => setEditCategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Categoría activa</span>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetEditCategoryForm}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {editingSubcategoryContext !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleUpdateSubcategory} className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Editar Subcategoría</h3>

            <div className="mb-3">
              <label htmlFor="edit-subcategory-code" className="block text-xs text-gray-600">Código</label>
              <input
                id="edit-subcategory-code"
                value={editSubcategoryForm.code}
                onChange={(e) => setEditSubcategoryForm((prev) => ({ ...prev, code: e.target.value.replace(/\D/g, "") }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {editSubcategoryErrors.code && <p className="mt-1 text-xs text-red-600">{editSubcategoryErrors.code}</p>}
            </div>

            <div className="mb-3">
              <label htmlFor="edit-subcategory-name" className="block text-xs text-gray-600">Nombre</label>
              <input
                id="edit-subcategory-name"
                value={editSubcategoryForm.name}
                onChange={(e) => setEditSubcategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              {editSubcategoryErrors.name && <p className="mt-1 text-xs text-red-600">{editSubcategoryErrors.name}</p>}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editSubcategoryForm.isActive}
                  onChange={(e) => setEditSubcategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Estado activo</span>
              </label>
            </div>

            <div className="mb-4">
              <label htmlFor="edit-subcategory-description" className="block text-xs text-gray-600">Descripción</label>
              <textarea
                id="edit-subcategory-description"
                value={editSubcategoryForm.description}
                onChange={(e) => setEditSubcategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                rows={3}
              />
              {editSubcategoryErrors.description && <p className="mt-1 text-xs text-red-600">{editSubcategoryErrors.description}</p>}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetEditSubcategoryForm}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
