/**
 * Interpolates two numbers
 * @param a Origin number
 * @param b Target number
 * @param t Progress
 * @returns The first given number intepolated towards the second given one
 * @author Álvaro Fernández Barrero
 */
export const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;