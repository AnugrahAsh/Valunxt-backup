/**
 * The listing table of a table-backed screen: the declared columns, each row's
 * actions, and the empty states. Server-rendered; the delete button is the
 * panel's two-press ConfirmSubmit.
 */
import ConfirmSubmit from './ConfirmSubmit';
import Icon from './Icon';
import ResourceValue from './ResourceValue';
import { resourceOpAction } from '@/lib/admin/resource-actions';
import { adminUrl } from '@/lib/admin/config';
import type { ResourceDef } from '@/lib/admin/resource-types';
import type { ResourceRow } from '@/lib/admin/resource-db';
import { RESOURCES } from '@/lib/admin/resources';

/** Whether a resource has child resources, and so a detail page. */
export function hasChildren(def: ResourceDef): boolean {
  return RESOURCES.some((r) => r.parent?.resource === def.key);
}

export default function ResourceTable({
  def,
  rows,
  csrf,
  back,
  parentId = '',
  hideParentColumn = false,
  filtered = false,
}: {
  def: ResourceDef;
  rows: ResourceRow[];
  csrf: string;
  /** Where a delete returns to. */
  back: string;
  parentId?: string;
  hideParentColumn?: boolean;
  filtered?: boolean;
}) {
  const columns = def.fields.filter((f) => f.list && !(hideParentColumn && def.parent?.field === f.name));
  const detail = hasChildren(def);
  const writable = def.fields.some((f) => !f.readOnly && !f.formHidden);
  const q = (id: string) => '?id=' + encodeURIComponent(id) + (parentId ? '&parent=' + encodeURIComponent(parentId) : '');

  if (!rows.length) {
    return (
      <div className="empty-state compact">
        <span className="empty-ico">
          <Icon name={filtered ? 'search' : def.icon} size={24} />
        </span>
        <h4>{filtered ? `No ${def.label.toLowerCase()} match` : `No ${def.label.toLowerCase()} yet`}</h4>
        <p>
          {filtered
            ? 'Clear the search or filters to see everything.'
            : def.create
              ? `Use “New ${def.singular}” to add the first one.`
              : 'Nothing has been recorded.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="data">
        <thead>
          <tr>
            {columns.map((f) => (
              <th key={f.name}>{f.label}</th>
            ))}
            <th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = row[def.pk];
            const title = String(row[def.titleField] ?? key).slice(0, 60);
            return (
              <tr key={key}>
                {columns.map((f, i) => (
                  <td key={f.name} className={i === 0 ? 'title-cell' : undefined}>
                    {i === 0 && (detail || def.edit) ? (
                      <a href={adminUrl(`${def.key}/${detail ? 'view' : 'edit'}`) + q(key)}>
                        <ResourceValue field={f} row={row} />
                      </a>
                    ) : (
                      <ResourceValue field={f} row={row} />
                    )}
                  </td>
                ))}
                <td>
                  <div className="row-actions">
                    {detail ? (
                      <a className="icon-btn" href={adminUrl(`${def.key}/view`) + q(key)} title="Open" aria-label={`Open ${title}`}>
                        <Icon name="eye" size={16} />
                      </a>
                    ) : null}
                    {def.edit ? (
                      <a
                        className="icon-btn"
                        href={adminUrl(`${def.key}/edit`) + q(key)}
                        title={writable ? 'Edit' : 'View'}
                        aria-label={`${writable ? 'Edit' : 'View'} ${title}`}
                      >
                        <Icon name={writable ? 'edit' : 'file'} size={16} />
                      </a>
                    ) : null}
                    {def.remove ? (
                      <form action={resourceOpAction}>
                        <input type="hidden" name="resource" value={def.key} />
                        <input type="hidden" name="op" value="delete" />
                        <input type="hidden" name="csrf" value={csrf} />
                        <input type="hidden" name="id" value={key} />
                        <input type="hidden" name="back" value={back} />
                        <ConfirmSubmit label={`Delete ${title}`} className="icon-btn danger">
                          <Icon name="trash" size={16} />
                        </ConfirmSubmit>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
