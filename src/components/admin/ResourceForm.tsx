'use client';

/**
 * The create / edit form of a table-backed screen, drawn from its declaration.
 *
 * Every input is the panel's own field markup. Validation runs on the server
 * (lib/admin/resource-actions.ts) and comes back per field; the browser adds
 * only what HTML gives for free (required, maxlength, input types).
 */
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import Icon from './Icon';
import ResourceValue from './ResourceValue';
import { useSubmitRound } from './useSubmitRound';
import { saveResourceAction, type ResourceFormState } from '@/lib/admin/resource-actions';
import type { FieldDef } from '@/lib/admin/resource-types';

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn primary" disabled={pending}>
      <Icon name="save" size={16} />
      {pending ? 'Saving…' : label}
    </button>
  );
}

/** A DATETIME as the value a datetime-local input takes. */
function toLocalInput(v: string): string {
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/.exec(v);
  return m ? `${m[1]}T${m[2]}` : '';
}

export default function ResourceForm({
  resource,
  singular,
  isNew,
  rowKey,
  parentId,
  csrf,
  fields,
  values,
  relationOptions,
  cancelHref,
}: {
  resource: string;
  singular: string;
  isNew: boolean;
  rowKey: string;
  parentId: string;
  csrf: string;
  fields: FieldDef[];
  /** The row's current values (or defaults), as strings, relation labels included. */
  values: Record<string, string>;
  /** column -> [value, label] for each relation field. */
  relationOptions: Record<string, Array<[string, string]>>;
  cancelHref: string;
}) {
  const [state, action] = useActionState<ResourceFormState | null, FormData>(saveResourceAction, null);
  const errors = state?.errors ?? {};
  const v = { ...values, ...(state?.values ?? {}) };
  const round = useSubmitRound(state);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.errors || !Object.keys(state.errors).length) return;
    const target = formRef.current?.querySelector<HTMLElement>('.is-invalid') ?? formRef.current?.querySelector<HTMLElement>('.flash.err');
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [state]);

  const shown = fields.filter((f) => !f.formHidden && !(f.createOnly && !isNew && !f.readOnly));
  const editable = shown.some((f) => !f.readOnly && !(f.createOnly && !isNew));

  const control = (f: FieldDef) => {
    const common = {
      id: `f_${f.name}`,
      name: f.name,
      className: errors[f.name] ? 'is-invalid' : undefined,
      'aria-invalid': errors[f.name] ? true : undefined,
      required: f.required && f.type !== 'password' ? true : undefined,
      placeholder: f.placeholder,
    };
    const value = v[f.name] ?? '';

    if (f.readOnly || (f.createOnly && !isNew)) {
      return (
        <div className="readonly-value">
          <ResourceValue field={f} row={v} long />
        </div>
      );
    }

    switch (f.type) {
      case 'textarea':
        return <textarea {...common} rows={4} defaultValue={value} maxLength={f.max} />;
      case 'json':
      case 'code':
        return <textarea {...common} className={'code-area' + (errors[f.name] ? ' is-invalid' : '')} rows={10} spellCheck={false} defaultValue={value} />;
      case 'checkbox':
        return (
          <label className="check">
            <input type="checkbox" name={f.name} value="1" defaultChecked={value === '1'} />
            {f.label}
          </label>
        );
      case 'select':
        return (
          <select key={round} {...common} defaultValue={value}>
            {f.nullable || !f.required ? <option value="">— Not set —</option> : null}
            {(f.options ?? []).map(([o, l]) => (
              <option value={o} key={o}>
                {l}
              </option>
            ))}
          </select>
        );
      case 'relation':
        return (
          <select key={round} {...common} defaultValue={value}>
            {f.nullable || !f.required ? <option value="">— None —</option> : <option value="">Choose…</option>}
            {(relationOptions[f.name] ?? []).map(([o, l]) => (
              <option value={o} key={o}>
                {l}
              </option>
            ))}
          </select>
        );
      case 'password':
        return <input {...common} type="password" autoComplete="new-password" minLength={8} maxLength={200} />;
      case 'int':
      case 'decimal':
        return (
          <input
            {...common}
            type="number"
            step={f.type === 'decimal' ? '0.01' : '1'}
            min={f.min}
            max={f.max}
            defaultValue={value}
          />
        );
      case 'date':
        return <input {...common} type="date" defaultValue={value.slice(0, 10)} />;
      case 'datetime':
        return <input {...common} type="datetime-local" defaultValue={toLocalInput(value)} />;
      case 'email':
        return <input {...common} type="email" defaultValue={value} maxLength={f.max} />;
      case 'url':
        return <input {...common} type="url" defaultValue={value} maxLength={f.max} />;
      case 'tel':
        return <input {...common} type="tel" defaultValue={value} maxLength={f.max} />;
      default:
        return <input {...common} type="text" defaultValue={value} maxLength={f.max} />;
    }
  };

  return (
    <form action={action} ref={formRef}>
      <input type="hidden" name="resource" value={resource} />
      <input type="hidden" name="csrf" value={csrf} />
      <input type="hidden" name="mode" value={isNew ? 'new' : 'edit'} />
      <input type="hidden" name="id" value={rowKey} />
      <input type="hidden" name="parent" value={parentId} />

      {errors.general ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">{errors.general}</span>
        </div>
      ) : Object.keys(errors).length ? (
        <div className="flash err" role="alert">
          <Icon name="alertCircle" />
          <span className="flash-text">The {singular.toLowerCase()} was not saved. Correct the highlighted fields and try again.</span>
        </div>
      ) : null}

      <section className="panel">
        <div className="panel-body">
          <div className="form-grid">
            {shown.map((f) => (
              <div className={'fld' + (f.full || f.type === 'textarea' || f.type === 'json' ? ' full' : '')} key={f.name}>
                {f.type === 'checkbox' && !f.readOnly ? null : (
                  <label htmlFor={`f_${f.name}`}>
                    {f.label}
                    {f.required && !f.readOnly ? <span className="req" aria-hidden="true"> *</span> : null}
                  </label>
                )}
                {control(f)}
                {errors[f.name] ? (
                  <div className="hint" style={{ color: 'var(--danger)' }}>
                    {errors[f.name]}
                  </div>
                ) : null}
                {f.help && !(f.readOnly || (f.createOnly && !isNew)) ? <div className="hint">{f.help}</div> : null}
              </div>
            ))}
          </div>
        </div>
        <div className="form-actions">
          {editable ? <SaveButton label={isNew ? `Create ${singular}` : 'Save changes'} /> : null}
          <a href={cancelHref} className="btn">
            {editable ? 'Cancel' : 'Back'}
          </a>
        </div>
      </section>
    </form>
  );
}
