/// <reference types="@nuxtblog/plugin-sdk" />

// ── Markdown / HTML stripping ───────────────────────────────────────────

function stripToPlainText(s: string): string {
  if (!s) return ""
  // code blocks
  s = s.replace(/```[\s\S]*?```/g, "")
  // HTML tags
  s = s.replace(/<[^>]+>/g, "")
  // images ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
  // links [text](url)
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  // headings # ~ ######
  s = s.replace(/^#{1,6}\s+/gm, "")
  // bold/italic
  s = s.replace(/(\*{1,3}|_{1,3})(.+?)\1/g, "$2")
  // inline code
  s = s.replace(/`([^`]+)`/g, "$1")
  // blockquotes
  s = s.replace(/^>\s?/gm, "")
  // horizontal rules
  s = s.replace(/^[-*_]{3,}\s*$/gm, "")
  // unordered list markers
  s = s.replace(/^[\t ]*[-*+]\s+/gm, "")
  // ordered list markers
  s = s.replace(/^[\t ]*\d+\.\s+/gm, "")
  // collapse whitespace
  s = s.replace(/\s+/g, " ")
  return s.trim()
}

// ── Truncation ──────────────────────────────────────────────────────────

function buildExcerpt(content: string, maxLength: number, ellipsis: string): string {
  const plain = stripToPlainText(content)
  if (plain.length <= maxLength) return plain

  let truncated = plain.substring(0, maxLength)

  // try to break at punctuation or whitespace
  const breakChars = ".!?;,，。！？；、 \t\n"
  let bestIdx = -1
  for (let i = truncated.length - 1; i >= Math.floor(truncated.length / 2); i--) {
    if (breakChars.indexOf(truncated[i]) !== -1) {
      bestIdx = i
      break
    }
  }
  if (bestIdx > 0) {
    truncated = truncated.substring(0, bestIdx)
  }

  return truncated.trim() + ellipsis
}

// ── Filter handler ──────────────────────────────────────────────────────

function handlePost(fc: FilterContext<FilterPostCreateData>): void {
  const mode = ctx.settings.get("mode") || "auto"
  const maxLength = (ctx.settings.get("max_length") as number) || 160
  const ellipsis = (ctx.settings.get("ellipsis") as string) || "…"

  // auto mode: skip if excerpt already exists
  if (mode === "auto") {
    const existing = fc.data.excerpt || ""
    if (existing) return
  }

  const content = fc.data.content || ""
  if (!content) return

  const excerpt = buildExcerpt(content, maxLength, ellipsis)
  if (excerpt) {
    ctx.log.info("[auto-excerpt] generated " + excerpt.length + " chars")
    fc.data.excerpt = excerpt
  }
}

// ── Plugin export ───────────────────────────────────────────────────────

module.exports = {
  activate() {
    ctx.log.info("Auto Excerpt plugin activated (JS)")
  },

  deactivate() {},

  filters: [
    {
      event: "filter:post.create" as const,
      handler(fc: FilterContext<FilterPostCreateData>) { handlePost(fc) },
    },
    {
      event: "filter:post.update" as const,
      handler(fc: FilterContext<FilterPostUpdateData>) { handlePost(fc as FilterContext<FilterPostCreateData>) },
    },
  ],
} satisfies PluginExports
