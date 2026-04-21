export interface Occasion {
  value: string;
  label: string;
}

export const OCCASIONS: Occasion[] = [
  { value: "Birthday", label: "Birthday" },
  { value: "Holidays", label: "Christmas / Holidays" },
  { value: "Welcome Baby", label: "Welcome Baby" },
  { value: "Graduation", label: "Graduation" },
  { value: "Bar/Bat Mitzvah", label: "Bar / Bat Mitzvah" },
  { value: "Just Because", label: "Just Because" },
];

export function isValidOccasion(value: string): boolean {
  return OCCASIONS.some((o) => o.value === value);
}
