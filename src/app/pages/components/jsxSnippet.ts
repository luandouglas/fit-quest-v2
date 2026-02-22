function escapeString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function serializeValue(value: unknown) {
  if (typeof value === 'string') {
    return `"${escapeString(value)}"`
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `{${String(value)}}`
  }

  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return `{${JSON.stringify(value)}}`
  }

  return '{undefined}'
}

export function toJsxSnippet(name: string, props: Record<string, unknown>) {
  const entries = Object.entries(props).filter(
    ([key, value]) => key !== 'children' && value !== undefined && typeof value !== 'function',
  )

  const attrs = entries
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${escapeString(value)}"`
      }

      return `${key}=${serializeValue(value)}`
    })
    .join(' ')

  const openTag = attrs.length ? `<${name} ${attrs}>` : `<${name}>`
  const children = typeof props.children === 'string' ? props.children : null

  if (children !== null) {
    return `${openTag}${children}</${name}>`
  }

  if (openTag.endsWith('>')) {
    return `${openTag.slice(0, -1)} />`
  }

  return `<${name} />`
}
