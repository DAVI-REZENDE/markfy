/**
 * Utilitários para manipulação de conteúdo do editor
 */

/**
 * Extrai o título do H1 do conteúdo HTML
 */
export const extractTitleFromContent = (htmlContent: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const h1Element = doc.querySelector('h1')
  return h1Element ? h1Element.textContent?.trim() || '' : ''
}

/**
 * Extrai o conteúdo sem o H1
 */
export const extractContentWithoutTitle = (htmlContent: string): string => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlContent, 'text/html')
  const h1Element = doc.querySelector('h1')
  if (h1Element) {
    h1Element.remove()
  }
  return doc.body.innerHTML
}

/**
 * Cria o conteúdo HTML com título como H1
 */
export const createContentWithTitle = (title: string, content: string): string => {
  if (!title.trim()) return content
  return `<h1>${title}</h1>${content}`
}
