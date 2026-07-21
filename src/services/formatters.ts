// src/utils/formatters.ts

export function formatarValor(valor: number | string): string {
    if (!valor) return '0,00'
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor
    const [inteiros, decimais] = valorNumerico.toFixed(2).split('.')
    const integrosFormatados = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${integrosFormatados},${decimais}`
}

export function formatarInteiroComoMoeda(valor: string) {
    const centavos = parseInt(valor.replace(/\D/g, '')) || 0;
    return (centavos / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
/*
onChange={(e) => setPreco(formatarInteiroComoMoeda(e.target.value))}
*/
