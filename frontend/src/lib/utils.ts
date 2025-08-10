import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getDefaultSorter({
  refField,
  fieldName,
  sortOrder,
}: {
  refField: string;
  fieldName: string;
  sortOrder: "ascend" | "descend";
}) {
  if (refField === fieldName) {
    return {
      sortOrder,
    };
  }
}
