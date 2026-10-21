/**
 * Interpolates two numbers
 * @param a Origin number
 * @param b Target number
 * @param t Progress
 * @returns The first given number intepolated towards the second given one
 * @author Álvaro Fernández Barrero
 */
export const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

/**
 * Smoothens interpolations
 * @param t Alpha lerp's channel
 * @returns Another computer parameter alpha for smooth interpolations
 * @author Álvaro Fernández Barrero
 */
export const cubicEasingIn = (t: number) => t * t * t;

/**
 * Smoothens interpolations
 * @param t Alpha lerp's channel
 * @returns Another computer parameter alpha for smooth interpolations
 * @author Álvaro Fernández Barrero
 */
export const cubicEasingOut = (t: number) => {
    let oneMinutT = 1 - t;
    return 1 - oneMinutT * oneMinutT * oneMinutT;
};