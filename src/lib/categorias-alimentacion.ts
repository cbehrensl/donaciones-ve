import type { CategoriaProductor } from "@/lib/types";

/** Opciones de necesidad que ve la cocina al registrar ingredientes. */
export const CATEGORIAS_NECESIDAD_COCINA: {
  label: string;
  familia: CategoriaProductor;
}[] = [
  { label: "Proteínas (carne, pollo, pescado)", familia: "proteinas" },
  { label: "Proteínas (huevos)", familia: "proteinas" },
  { label: "Vegetales frescos", familia: "vegetales" },
  { label: "Tubérculos (papas, yuca, auyama)", familia: "vegetales" },
  { label: "Frutas frescas", familia: "frutas" },
  { label: "Granos (caraotas, lentejas, arvejas)", familia: "granos" },
  { label: "Arroz", familia: "granos" },
  { label: "Harinas", familia: "no_perecederos" },
  { label: "Aceite", familia: "no_perecederos" },
  { label: "Azúcar", familia: "no_perecederos" },
  { label: "Sal y condimentos", familia: "otros" },
  { label: "Lácteos", familia: "lacteos" },
  { label: "Alimentos no perecederos (enlatados)", familia: "no_perecederos" },
  { label: "Otros", familia: "otros" },
];

export const CATEGORIA_PRODUCTOR_LABELS: Record<CategoriaProductor, string> = {
  proteinas: "Proteínas",
  vegetales: "Vegetales",
  no_perecederos: "No perecederos",
  lacteos: "Lácteos",
  granos: "Granos",
  frutas: "Frutas",
  otros: "Otros",
};

const NECESIDAD_A_FAMILIA = new Map(
  CATEGORIAS_NECESIDAD_COCINA.map((item) => [item.label, item.familia]),
);

/** Mapea una necesidad de cocina (texto) a la familia de categoría del productor. */
export function familiaDeNecesidadCocina(categoria: string): CategoriaProductor {
  return NECESIDAD_A_FAMILIA.get(categoria) ?? "otros";
}

/** ¿La cocina necesita algo que el productor puede aportar? */
export function necesidadCoincideConProductor(
  categoriaNecesidad: string,
  categoriasProductor: CategoriaProductor[],
): boolean {
  const familia = familiaDeNecesidadCocina(categoriaNecesidad);
  return categoriasProductor.includes(familia);
}
