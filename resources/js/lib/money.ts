/**
 * Prices are stored as integer centavos on the server to avoid floating point
 * rounding; these helpers convert to and from the peso values people type.
 */
export function formatCentavos(centavos: number): string {
    return `₱${(centavos / 100).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export function toCentavos(pesos: number | string): number {
    return Math.round(Number(pesos) * 100);
}

export function toPesos(centavos: number): number {
    return centavos / 100;
}
