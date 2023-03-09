export function parseMarkdown(text, options = {}) {
  const ctx = {
    source: text,
    cursor: 0,
    indices: [],
    validTags: new Set(options.validTags),
  }
  const parent = { type: "root", children: [] }

  parseChildren(ctx, parent)

  const lastChild = parent.children[parent.children.length - 1]
  const textStart = lastChild ? lastChild.tagEnd : 0

  parent.children.push(Text(ctx.source.slice(textStart)))

  return parent
}

function parseChildren(ctx, parent) {
  for (; ctx.cursor < ctx.source.length; ) {
    const char = ctx.source[ctx.cursor]

    if (char === "<") {
      if (parseTagEnd(ctx, parent) === true) {
        const lastChild = parent.children[parent.children.length - 1]
        const textStart = lastChild ? lastChild.tagEnd : parent.childrenStart

        parent.children.push(
          Text(ctx.source.slice(textStart, parent.childrenEnd))
        )

        return
      }

      const node = parseReactTag(ctx, parent)
      if (node) {
        const lastNode = parent.children[parent.children.length - 1]
        const textStart = lastNode ? lastNode.tagEnd : parent.childrenStart || 0

        parent.children.push(Text(ctx.source.slice(textStart, node.tagStart)))
        parent.children.push(node)
      }
    }

    ctx.cursor++
  }
}

function parseTagEnd(ctx, parent) {
  if (ctx.source[ctx.cursor + 1] !== "/" || parent.type !== "tag") {
    return false
  }

  ctx.cursor += 2

  const tagName = ctx.source.slice(ctx.cursor, ctx.cursor + parent.name.length)

  if (tagName !== parent.name) {
    return false
  }

  parent.childrenEnd = ctx.cursor - 2

  ctx.cursor += parent.name.length + 1
  parent.tagEnd = ctx.cursor

  return true
}

function parseReactTag(ctx) {
  ctx.cursor++

  const char = ctx.source[ctx.cursor]

  const isReactTag = new RegExp("[A-Z]").test(char)
  if (isReactTag === false) return

  const tagStart = ctx.cursor - 1
  const name = parseReactTagName(ctx)

  if (ctx.validTags.has(name) === false) {
    return
  }

  const node = Tag(name, tagStart)

  parseAttributes(ctx, node)

  node.childrenStart = ctx.cursor

  parseChildren(ctx, node)

  return node
}

function parseReactTagName(ctx) {
  const { cursor, source } = ctx

  for (; ctx.cursor < source.length; ) {
    const char = source[ctx.cursor]

    if (char === " " || char === ">") {
      return source.slice(cursor, ctx.cursor)
    }

    ctx.cursor++
  }
}

function parseAttributes(ctx, node) {
  const hasAttributes = ctx.source[ctx.cursor] === " "

  ctx.cursor++

  if (hasAttributes === false) return

  for (; ctx.cursor < ctx.source.length; ) {
    const char = ctx.source[ctx.cursor]

    if (char === ">") {
      ctx.cursor++
      return
    }

    const attribute = parseAttribute(ctx)
    if (attribute) node.attributes[attribute.name] = attribute.value

    ctx.cursor++
  }
}

function parseAttribute(ctx) {
  const { source, cursor } = ctx

  for (; ctx.cursor < source.length; ) {
    const char = source[ctx.cursor]

    if (char === "=") {
      return {
        name: source.slice(cursor, ctx.cursor),
        value: parseAttributeValue(ctx),
      }
    }

    ctx.cursor++
  }
}

function parseAttributeValue(ctx) {
  ctx.cursor++

  const openClose = ctx.source[ctx.cursor]

  const start = ++ctx.cursor

  for (; ctx.cursor < ctx.source.length; ) {
    const char = ctx.source[ctx.cursor]
    if (char === openClose && ctx.source[ctx.cursor - 1] !== "\\") {
      return ctx.source.slice(start, ctx.cursor)
    }

    ctx.cursor++
  }
}

function Text(data) {
  return { type: "text", data }
}

function Tag(name, tagStart) {
  return { type: "tag", name, attributes: {}, children: [], tagStart }
}
