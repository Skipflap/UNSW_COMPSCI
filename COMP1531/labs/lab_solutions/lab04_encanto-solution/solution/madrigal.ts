/*
@see madrigal.alternative.js for a more javascripty solution :)
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
  if (gift === undefined) {
    return { name, age };
  }
  return { name, age, gift };
}

export function createSong(name: string, singers: string | string[]): Song {
  return { name, singers };
}

export function extractNamesMixed(array: (Madrigal | Song)[]): string[] {
  const names: string[] = [];
  for (const madrigalOrSong of array) {
    names.push(madrigalOrSong.name);
  }
  return names;
}

export function extractNamesPure(array: Madrigal[] | Song[]): string[] {
  return extractNamesMixed(array);
}

export function madrigalIsSinger(madrigal: Madrigal, song: Song): boolean {
  if (typeof song.singers === 'string') {
    return song.singers === madrigal.name;
  }
  return song.singers.includes(madrigal.name);
}

export function sortedMadrigals(madrigals: Madrigal[]): Madrigal[] {
  return [...madrigals].sort((m1, m2) => {
    if (m1.age !== m2.age) {
      return m1.age - m2.age;
    }
    return m1.name.localeCompare(m2.name);
  });
}

export function filterSongsWithMadrigals(madrigals: Madrigal[], songs: Song[]): Song[] {
  const filteredSongs: Song[] = [];
  for (const song of songs) {
    for (const madrigal of madrigals) {
      if (madrigalIsSinger(madrigal, song)) {
        filteredSongs.push(song);
        break;
      }
    }
  }
  return filteredSongs;
}

export function getMostSpecialMadrigal(madrigals: Madrigal[], songs: Song[]): Madrigal {
  // Guaranteed that list will have at least 1 element
  let mostSpecialMadrigal: Madrigal = madrigals[0];
  let maxSongs = -Infinity;
  for (const madrigal of madrigals) {
    let songCount = 0;
    for (const song of songs) {
      if (madrigalIsSinger(madrigal, song)) {
        songCount++;
      }
    }
    if (maxSongs < songCount) {
      maxSongs = songCount;
      mostSpecialMadrigal = madrigal;
    }
  }
  return mostSpecialMadrigal;
}
