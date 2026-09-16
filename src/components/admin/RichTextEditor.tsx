'use client';

/**
 * The article body editor.
 *
 * A post's body is stored as the same HTML the public article renders — the
 * shape src/data/articles.ts carried and BlogArticleSection styles: paragraphs,
 * h2/h3 subheadings, lists, links and the occasional blockquote. So the editor
 * writes that HTML directly rather than a document format that would have to be
 * converted on the way in and out.
 *
 * No editor dependency: a `contenteditable` region with a small command bar,
 * plus a source view for anyone who would rather type the markup. React is kept
 * out of the editable node — it is written once on mount and owned by the
 * browser from then on, because re-rendering a contenteditable moves the caret
 * to the start on every keystroke.
 */
import { useEffect, useRef, useState } from 'react';

import Icon from './Icon';
import { blogPlainText, blogReadTime } from '@/lib/blog/types';

type Command = { label: string; title: string; run: () => void; bold?: boolean };

/** Tags a pasted or typed body may keep. Everything else is unwrapped. */
const ALLOWED = new Set([
  'P', 'BR', 'H2', 'H3', 'H4', 'STRONG', 'B', 'EM', 'I', 'U', 'A',
  'UL', 'OL', 'LI', 'BLOCKQUOTE', 'FIGURE', 'FIGCAPTION', 'IMG', 'HR',
]);

/**
 * Strip anything the article stylesheet does not style — scripts, inline
 * styles, Word's <span class="Apple-…"> wrappers — keeping the text and the
 * structural tags. Runs in the browser, on content an administrator pasted.
 */
function cleanHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const holder = document.createElement('div');
  holder.innerHTML = html;

  holder.querySelectorAll('script, style, meta, link').forEach((n) => n.remove());

  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) walk(child);
    if (!ALLOWED.has(node.tagName)) {
      // Keep the words, drop the wrapper.
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }
    for (const attr of Array.from(node.attributes)) {
      const keep =
        (node.tagName === 'A' && (attr.name === 'href' || attr.name === 'target' || attr.name === 'rel')) ||
        (node.tagName === 'IMG' && (attr.name === 'src' || attr.name === 'alt'));
      if (!keep) node.removeAttribute(attr.name);
    }
  };
  for (const child of Array.from(holder.children)) walk(child);

  return holder.innerHTML.replace(/\s+/g, ' ').replace(/>\s+</g, '>\n<').trim();
}

export default function RichTextEditor({
  name,
  initialHtml,
  invalid = false,
  onChange,
}: {
  /** The form field the HTML is submitted under. */
  name: string;
  initialHtml: string;
  invalid?: boolean;
  onChange?: (html: string) => void;
}) {
  const editable = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initialHtml);
  const [source, setSource] = useState(false);

  // Written once: React must never re-render the editable node's children.
  useEffect(() => {
    if (editable.current && editable.current.innerHTML === '') {
      editable.current.innerHTML = initialHtml;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publish = (next: string) => {
    setHtml(next);
    onChange?.(next);
  };

  /** Read the editable node back into state after a command or a keystroke. */
  const sync = () => {
    if (editable.current) publish(editable.current.innerHTML);
  };

  const exec = (command: string, value?: string) => {
    editable.current?.focus();
    document.execCommand(command, false, value);
    sync();
  };

  const block = (tag: string) => exec('formatBlock', `<${tag}>`);

  const link = () => {
    const url = window.prompt('Link address (https://… or /en-ae/contact/)');
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed === '') exec('unlink');
    else exec('createLink', trimmed);
  };

  const commands: Command[] = [
    { label: 'B', title: 'Bold (Ctrl+B)', run: () => exec('bold'), bold: true },
    { label: 'I', title: 'Italic (Ctrl+I)', run: () => exec('italic') },
    { label: 'Paragraph', title: 'Body paragraph', run: () => block('p') },
    { label: 'H2', title: 'Section heading', run: () => block('h2') },
    { label: 'H3', title: 'Sub heading', run: () => block('h3') },
    { label: 'List', title: 'Bulleted list', run: () => exec('insertUnorderedList') },
    { label: '1. List', title: 'Numbered list', run: () => exec('insertOrderedList') },
    { label: 'Quote', title: 'Block quote', run: () => block('blockquote') },
    { label: 'Link', title: 'Insert or edit a link', run: link },
    { label: 'Unlink', title: 'Remove the link', run: () => exec('unlink') },
    { label: 'Clear', title: 'Remove formatting', run: () => exec('removeFormat') },
  ];

  const words = blogPlainText(html).split(/\s+/).filter(Boolean).length;

  return (
    <div className={'rte' + (invalid ? ' is-invalid' : '')}>
      {/* What the form actually submits. */}
      <input type="hidden" name={name} value={html} />

      <div className="rte-bar" role="toolbar" aria-label="Formatting">
        {commands.map((c) => (
          <button
            key={c.label}
            type="button"
            className={'rte-btn' + (c.bold ? ' is-bold' : '')}
            title={c.title}
            aria-label={c.title}
            // Keep the selection: a button that takes focus first loses it.
            onMouseDown={(e) => e.preventDefault()}
            onClick={c.run}
            disabled={source}
          >
            {c.label}
          </button>
        ))}
        <span className="rte-gap" />
        <button
          type="button"
          className={'rte-btn' + (source ? ' is-on' : '')}
          title="Edit the underlying HTML"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            // Leaving source view puts the typed markup back into the editor.
            if (source && editable.current) editable.current.innerHTML = html;
            setSource((v) => !v);
          }}
        >
          <Icon name="edit" size={14} />
          HTML
        </button>
      </div>

      {source ? (
        <textarea
          className="rte-source"
          value={html}
          spellCheck={false}
          rows={18}
          aria-label="Article HTML"
          onChange={(e) => publish(e.target.value)}
        />
      ) : (
        <div
          ref={editable}
          className="rte-area vxn-art-content"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Article body"
          data-placeholder="Write the article. Use H2 and H3 for the subheadings the article page styles."
          onInput={sync}
          onBlur={sync}
          onPaste={(e) => {
            // Paste as clean markup, so a Word or web paste cannot bring a
            // stylesheet's worth of inline styles into the article.
            e.preventDefault();
            const clip = e.clipboardData;
            const pastedHtml = clip.getData('text/html');
            if (pastedHtml) {
              document.execCommand('insertHTML', false, cleanHtml(pastedHtml));
            } else {
              document.execCommand('insertText', false, clip.getData('text/plain'));
            }
            sync();
          }}
        />
      )}

      <div className="rte-foot">
        <span>
          {words} word{words === 1 ? '' : 's'} · {blogReadTime(html)}
        </span>
        <span className="rte-gap" />
        <button
          type="button"
          className="rte-btn"
          title="Tidy the markup: drop anything the article page does not style"
          onClick={() => {
            const next = cleanHtml(html);
            if (editable.current) editable.current.innerHTML = next;
            publish(next);
          }}
        >
          Clean up HTML
        </button>
      </div>
    </div>
  );
}
