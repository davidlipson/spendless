export const shortenText = (text: string, words: number) => {
    const textWords = text.replace(/\s+/g, ' ').split(' ').slice(0, words)
    const joined = textWords.join(' ')
    return joined.length < text.length ? `${joined}...` : text
}

