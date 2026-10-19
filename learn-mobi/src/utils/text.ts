/** 将服务端富文本转换为 text 组件可安全展示的摘要，不注入 HTML。 */
export function htmlToText(value?: string | null): string {
  const entities: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
  return (value || '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, ' ')
    .replace(/&(#x[\da-f]+|#\d+|nbsp|amp|lt|gt|quot|apos);/gi, (match, entity: string) => {
      if (!entity.startsWith('#')) return entities[entity.toLowerCase()] || match
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1))
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match
    })
    .replace(/\s+/g, ' ').trim()
}
