export function formatCNPJ(value) {
  return value
  .replace(/\D/g, "")
  .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3-$4.$5")
    .slice(0, 18);
}

export function formatTelefone(value) {
  return value
  .replace(/\D/g, "")
  .replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3")
    .slice(0, 15);
}
