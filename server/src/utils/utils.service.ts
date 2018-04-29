

/**
* @returns a random integer between min (inclusive) and max (inclusive)
* Using Math.round() will give you a non-uniform distribution!
 @param min - min number to randomize @param max - max number to randomize
*/
export function randomizeInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}