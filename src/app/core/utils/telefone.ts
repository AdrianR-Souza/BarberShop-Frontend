// Formata "44999787109" como "(44) 99978-7109"
export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone || !/^\d{11}$/.test(telefone)) {
    return telefone ?? '';
  }
  const ddd = telefone.slice(0, 2);
  const parte1 = telefone.slice(2, 7);
  const parte2 = telefone.slice(7);
  return `(${ddd}) ${parte1}-${parte2}`;
}
