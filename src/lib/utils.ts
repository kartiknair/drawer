export function truncate(words: string, maxWords: number): string {
  const split = words.split(' ')
  return split.length <= maxWords
    ? words
    : split.slice(0, maxWords).join(' ') + '...'
}
