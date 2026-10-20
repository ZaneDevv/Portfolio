/**
 * Gives a random number between the boundaries specified
 * @param {Number} min The minimum possible value to obtain
 * @param {Number} max The maximum possible value to obtain
 * @returns A random number between the minimum and maximum specified
 * @author Álvaro Fernández Barrero
 */
export const random = (min: number, max: number) : number => min + Math.random() * (max - min);

/**
 * Gives a random integer between the boundaries specified
 * @param {Number} min The minimum possible value to obtain
 * @param {Number} max The maximum possible value to obtain
 * @returns A random integer between the minimum and maximum specified
 * @author Álvaro Fernández Barrero
 */
export const randomInteger = (min: number, max: number) : number => min + Math.round(Math.random() * Math.abs(max - min));