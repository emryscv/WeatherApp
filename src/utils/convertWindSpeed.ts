export function convertWindSpeed(windSpeed: number): string {
    return `${Math.round(windSpeed * 3.6)} km/h`;
}