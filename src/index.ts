// ---------------------------------------------------------------------------
// auto-excerpt
//
// filter:post.create / filter:post.update 拦截，自动从正文生成摘要。
// 支持剥离 Markdown 语法和 HTML 标签。
// ---------------------------------------------------------------------------

// ── 读取设置 ──────────────────────────────────────────────────────────────

function getMode(): string {
  const v = nuxtblog.settings.get("mode");
  return v === "always" ? "always" : "auto";
}

function getMaxLength(): number {
  const v = nuxtblog.settings.get("max_length");
  const n = Number(v ?? 160);
  return isNaN(n) || n <= 0 ? 160 : n;
}

function getEllipsis(): string {
  const v = nuxtblog.settings.get("ellipsis");
  return typeof v === "string" && v.length > 0 ? v : "…";
}

// ── 核心转换 ──────────────────────────────────────────────────────────────

/**
 * 剥离 HTML 标签和常见 Markdown 语法，返回纯文本。
 */
function stripToPlainText(content: string): string {
  if (!content) return "";

  return (
    content
      // 代码块（三反引号），先处理避免内容干扰后续规则
      .replace(/```[\s\S]*?```/g, "")
      // HTML 标签
      .replace(/<[^>]+>/g, " ")
      // Markdown 标题 (#, ##, …)
      .replace(/^#{1,6}\s+/gm, "")
      // 粗体 / 斜体 (***text***, **text**, *text*, ___text___, __text__, _text_)
      .replace(/(\*{1,3}|_{1,3})([\s\S]*?)\1/g, "$2")
      // 链接 [text](url) / 图片 ![alt](url)
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
      // 行内代码 `code`
      .replace(/`[^`]+`/g, "")
      // 引用行 >
      .replace(/^>\s*/gm, "")
      // 分隔线 ---/***
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // 无序/有序列表标记
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // 折叠空白
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * 生成摘要：剥离格式后截断，必要时追加省略符。
 */
function buildExcerpt(content: string, maxLen: number, ellipsis: string): string {
  const text = stripToPlainText(content);
  if (!text) return "";
  if (text.length <= maxLen) return text;

  // 尽量在标点或空格处断句，避免截断到字词中间
  let truncated = text.slice(0, maxLen);
  const lastBreak = truncated.search(/[\s，。！？、；：,.!?;:]*$/);
  if (lastBreak > maxLen * 0.75) {
    truncated = truncated.slice(0, lastBreak);
  }

  return truncated.trim() + ellipsis;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

export function activate(ctx: PluginContext): void {
  ctx.subscriptions.push(
    nuxtblog.filter("post.create", (fCtx) => {
      const mode = getMode();
      const maxLen = getMaxLength();
      const ellipsis = getEllipsis();

      if (mode === "auto" && fCtx.data.excerpt?.trim()) return;
      if (!fCtx.data.content?.trim()) return;

      const excerpt = buildExcerpt(fCtx.data.content, maxLen, ellipsis);
      if (!excerpt) return;

      nuxtblog.log.info(`[auto-excerpt] create: 生成摘要 ${excerpt.length} 字符`);
      fCtx.data.excerpt = excerpt;
    }),

    nuxtblog.filter("post.update", (fCtx) => {
      if (!fCtx.data.content?.trim()) return;

      const mode = getMode();
      const maxLen = getMaxLength();
      const ellipsis = getEllipsis();

      if (mode === "auto" && fCtx.data.excerpt?.trim()) return;

      const excerpt = buildExcerpt(fCtx.data.content, maxLen, ellipsis);
      if (!excerpt) return;

      nuxtblog.log.info(`[auto-excerpt] update: 生成摘要 ${excerpt.length} 字符`);
      fCtx.data.excerpt = excerpt;
    }),
  );
}

export function deactivate(): void {}
