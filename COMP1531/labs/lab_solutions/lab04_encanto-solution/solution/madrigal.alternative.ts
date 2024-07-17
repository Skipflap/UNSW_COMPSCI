/*
@see madrigal.js for a less complex solution :)
*/

export interface Madrigal {
  name: string;
  age: number;
  gift?: string;
}

export interface Song {
  name: string;
  singers: string | string[];
}

export function createMadrigal(name: string, age: number, gift?: string): Madrigal {
  // return gift !== undefined ? { name, age, gift } : { name, age };
  return { name, age, ...(gift !== undefined && { gift }) };
}

export function createSong(name: string, singers: string | string[]): Song {
  return { name, singers };
}

export function extractNamesMixed(array: (Madrigal | Song)[]) {
  return array.map((i: Madrigal | Song) => i.name);
}

export function extractNamesPure(array: Madrigal[] | Song[]) {
  return extractNamesMixed(array);
}

export function madrigalIsSinger(madrigal: Madrigal, song: Song) {
  return song.singers.includes(madrigal.name);
}

export function sortedMadrigals(madrigals: Madrigal[]) {
  return [...madrigals].sort((m1, m2) => m1.age - m2.age || m1.name.localeCompare(m2.name));
}

export function filterSongsWithMadrigals(madrigals: Madrigal[], songs: Song[]) {
  return songs.filter(s => madrigals.some(m => madrigalIsSinger(m, s)));
}

export function getMostSpecialMadrigal(madrigals: Madrigal[], songs: Song[]) {
  return madrigals.reduce((m1, m2) => {
    const m1Songs = songs.filter(s => madrigalIsSinger(m1, s)).length;
    const m2Songs = songs.filter(s => madrigalIsSinger(m2, s)).length;
    return m1Songs >= m2Songs ? m1 : m2;
  });
}
