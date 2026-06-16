import katex from 'katex';

/**
 * Lightweight markdown renderer with KaTeX math support.
 * Handles: headings, bold, italic, code, code blocks, lists, blockquotes,
 * tables, horizontal rules, and inline/display LaTeX.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderKaTeX(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch {
    return `<span class="katex-error">${escapeHtml(latex)}</span>`;
  }
}

function renderLatexInText(text: string): string {
  // Display math first: $$...$$
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, latex: string) => {
    return renderKaTeX(latex.trim(), true);
  });

  // Inline math: $...$
  result = result.replace(/\$([^\$\n]+?)\$/g, (_, latex: string) => {
    return renderKaTeX(latex.trim(), false);
  });

  return result;
}

function renderInlineFormatting(text: string): string {
  // Inline code first (before bold/italic to avoid conflicts)
  let result = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');
  // Strikethrough
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // LaTeX inline
  result = renderLatexInText(result);
  return result;
}

function processTable(line: string): string[] {
  return line
    .split('|')
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);
}

export function renderMarkdown(text: string): string {
  const lines = text.split('\n');
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks (fenced)
    if (line.trimStart().startsWith('```')) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing ```
      const langAttr = lang ? ` class="language-${escapeHtml(lang)}"` : '';
      html.push(`<pre><code${langAttr}>${codeLines.join('\n')}</code></pre>`);
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = renderInlineFormatting(headingMatch[2]);
      html.push(`<h${level}>${content}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      html.push('<hr>');
      i++;
      continue;
    }

    // Unordered list
    if (/^[\s]*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\s]*[-*+]\s+/.test(lines[i])) {
        const content = renderInlineFormatting(lines[i].replace(/^[\s]*[-*+]\s+/, ''));
        items.push(`<li>${content}</li>`);
        i++;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^[\s]*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\s]*\d+\.\s+/.test(lines[i])) {
        const content = renderInlineFormatting(lines[i].replace(/^[\s]*\d+\.\s+/, ''));
        items.push(`<li>${content}</li>`);
        i++;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Nested list items (indented with 2+ spaces before - or *)
    if (/^[\s]{2,}[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[\s]{2,}[-*+]\s+/.test(lines[i])) {
        const content = renderInlineFormatting(lines[i].replace(/^[\s]{2,}[-*+]\s+/, ''));
        items.push(`<li>${content}</li>`);
        i++;
      }
      html.push(`<ul class="nested">${items.join('')}</ul>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      const inner = renderMarkdown(quoteLines.join('\n'));
      html.push(`<blockquote>${inner}</blockquote>`);
      continue;
    }

    // Table
    if (line.includes('|') && i + 1 < lines.length && /^\|?[\s:-]+\|/.test(lines[i + 1])) {
      const headerCells = processTable(line);
      i++; // skip header
      i++; // skip separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(processTable(lines[i]));
        i++;
      }
      const headerHtml = headerCells
        .map((c) => `<th>${renderInlineFormatting(c)}</th>`)
        .join('');
      const bodyHtml = rows
        .map(
          (row) =>
            `<tr>${row.map((c) => `<td>${renderInlineFormatting(c)}</td>`).join('')}</tr>`
        )
        .join('');
      html.push(
        `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trimStart().startsWith('#') &&
      !lines[i].trimStart().startsWith('```') &&
      !lines[i].startsWith('>') &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim()) &&
      !/^[\s]*[-*+]\s+/.test(lines[i]) &&
      !/^[\s]*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      const content = renderInlineFormatting(paraLines.join(' '));
      html.push(`<p>${content}</p>`);
    }
  }

  return html.join('\n');
}

export function renderLatex(text: string): string {
  return renderLatexInText(text);
}
