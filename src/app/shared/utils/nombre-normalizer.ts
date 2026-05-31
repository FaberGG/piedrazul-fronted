/**
 * Normaliza un campo de nombre o apellido:
 * elimina espacios extra, aplica title case y quita tildes de vocales (preserva ñ/Ñ).
 */
export function normalizarNombre(valor: string): string {
  if (!valor) return valor;

  // 1. Eliminar espacios al inicio, al final y colapsar espacios intermedios
  const limpio = valor.trim().replace(/\s+/g, ' ');

  // 2. Title case: primera letra de cada palabra en mayúscula, resto en minúscula
  const titulado = limpio
    .split(' ')
    .map(p => p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p)
    .join(' ');

  // 3. Quitar tildes de vocales (no afecta ñ/Ñ)
  return titulado
    .replace(/[áàäâ]/g, 'a').replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[éèëê]/g, 'e').replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[íìïî]/g, 'i').replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[óòöô]/g, 'o').replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[úùüû]/g, 'u').replace(/[ÚÙÜÛ]/g, 'U');
}
