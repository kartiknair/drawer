export function truncateWords(words: string, maxWords: number): string {
  const split = words.split(' ')
  return split.length <= maxWords
    ? words
    : split.slice(0, maxWords).join(' ') + '...'
}

export function truncate(str: string, maxLength: number): string {
  return str.length <= maxLength ? str : str.slice(0, maxLength) + '...'
}
