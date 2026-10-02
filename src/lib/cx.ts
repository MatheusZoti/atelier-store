/** Joins truthy class names. Component classes sit in @layer components, so utilities passed later always win. */
export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
