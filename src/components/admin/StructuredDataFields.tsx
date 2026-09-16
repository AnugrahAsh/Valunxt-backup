'use client';

/**
 * The FAQ and JSON-LD repeaters, shared by the post editor and the page editor.
 *
 * Both store what the imported www.valunxt.com panel stored: FAQ pairs as a
 * JSON array of { q, a }, and custom schema as a JSON array of JSON documents
 * kept as text. The fields post as faq_q[] / faq_a[] and schema_block[]; the
 * Server Actions assemble and validate them.
 */
import { useEffect, useState } from 'react';

import Icon from './Icon';

type Faq = { key: number; q: string; a: string };
type Block = { key: number; text: string };

let seq = 0;
const nextKey = () => ++seq;

/** Parse stored FAQ JSON into editable rows. */
export function faqRows(raw: string | null | undefined): Faq[] {
  try {
    const parsed = JSON.parse(String(raw ?? ''));
    if (Array.isArray(parsed)) {
      return parsed.map((f) => ({ key: nextKey(), q: String(f?.q ?? ''), a: String(f?.a ?? '') }));
    }
  } catch {
    /* none */
  }
  return [];
}

/** Parse stored schema JSON into editable blocks, pretty-printed. */
export function schemaRows(raw: string | null | undefined): Block[] {
  const text = String(raw ?? '').trim();
  if (!text) return [];
  const pretty = (b: string) => {
    try {
      return JSON.stringify(JSON.parse(b), null, 2);
    } catch {
      return b;
    }
  };
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed.map((b) => ({ key: nextKey(), text: pretty(typeof b === 'string' ? b : JSON.stringify(b)) }));
    }
    return [{ key: nextKey(), text: pretty(text) }];
  } catch {
    return [{ key: nextKey(), text }];
  }
}

export function FaqRepeater({ initial, resetToken }: { initial: string | null | undefined; resetToken?: unknown }) {
  const [rows, setRows] = useState<Faq[]>(() => faqRows(initial));

  // A rejected save hands the submitted values back: take them.
  useEffect(() => {
    if (resetToken !== undefined) setRows(faqRows(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  const update = (key: number, patch: Partial<Faq>) =>
    setRows((all) => all.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  return (
    <div className="repeater">
      {rows.length === 0 ? (
        <div className="repeater-empty">No questions yet. Posts with FAQs publish a FAQPage rich result.</div>
      ) : null}
      {rows.map((r, i) => (
        <div className="repeater-item" key={r.key}>
          <div className="repeater-head">
            <span>Question {i + 1}</span>
            <button type="button" className="btn sm ghost-danger" onClick={() => setRows((all) => all.filter((x) => x.key !== r.key))}>
              Remove
            </button>
          </div>
          <div className="fld full">
            <input
              type="text"
              name="faq_q"
              value={r.q}
              maxLength={500}
              placeholder="e.g. When is the corporate tax return due?"
              aria-label={`Question ${i + 1}`}
              onChange={(e) => update(r.key, { q: e.target.value })}
            />
          </div>
          <div className="fld full" style={{ marginTop: 10 }}>
            <label className="repeater-sub">Answer</label>
            <textarea
              name="faq_a"
              rows={3}
              value={r.a}
              placeholder="Plain-text answer shown on the page and in search results."
              aria-label={`Answer ${i + 1}`}
              onChange={(e) => update(r.key, { a: e.target.value })}
            />
          </div>
        </div>
      ))}
      <button type="button" className="btn sm" onClick={() => setRows((all) => [...all, { key: nextKey(), q: '', a: '' }])}>
        <Icon name="plus" size={14} stroke={2.4} />
        Add question
      </button>
    </div>
  );
}

export function SchemaRepeater({
  initial,
  resetToken,
  invalid,
}: {
  initial: string | null | undefined;
  resetToken?: unknown;
  invalid?: string;
}) {
  const [rows, setRows] = useState<Block[]>(() => schemaRows(initial));

  useEffect(() => {
    if (resetToken !== undefined) setRows(schemaRows(initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  const validity = (text: string): string => {
    if (!text.trim()) return '';
    try {
      const v = JSON.parse(text);
      return v && typeof v === 'object' ? '' : 'Must be a JSON object.';
    } catch {
      return 'Not valid JSON yet.';
    }
  };

  return (
    <div className="repeater">
      {rows.length === 0 ? (
        <div className="repeater-empty">
          No custom blocks. Add HowTo, Product, Event or other schema.org documents here.
        </div>
      ) : null}
      {rows.map((r, i) => {
        const problem = validity(r.text);
        return (
          <div className="repeater-item" key={r.key}>
            <div className="repeater-head">
              <span>Schema block {i + 1}</span>
              <button type="button" className="btn sm ghost-danger" onClick={() => setRows((all) => all.filter((x) => x.key !== r.key))}>
                Remove
              </button>
            </div>
            <textarea
              name="schema_block"
              className={'code-area' + (problem ? ' is-invalid' : '')}
              rows={8}
              spellCheck={false}
              value={r.text}
              placeholder={'{"@context":"https://schema.org","@type":"HowTo","name":"…"}'}
              aria-label={`Schema block ${i + 1}`}
              onChange={(e) => setRows((all) => all.map((x) => (x.key === r.key ? { ...x, text: e.target.value } : x)))}
            />
            {problem ? (
              <div className="hint" style={{ color: 'var(--danger)' }}>
                {problem}
              </div>
            ) : null}
          </div>
        );
      })}
      {invalid ? (
        <div className="hint" style={{ color: 'var(--danger)' }}>
          {invalid}
        </div>
      ) : null}
      <button type="button" className="btn sm" onClick={() => setRows((all) => [...all, { key: nextKey(), text: '' }])}>
        <Icon name="plus" size={14} stroke={2.4} />
        Add schema block
      </button>
    </div>
  );
}
