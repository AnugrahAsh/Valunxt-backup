'use server';

/**
 * Every write the Leads CRM performs, on `vx_leads` and `vx_lead_notes`.
 */
import { redirect } from 'next/navigation';

import { adminUrl, brandText } from './config';
import { requireCsrf, requireUser, safeBack } from './guard';
import { setFlash } from './session';
import { addLeadNote, deleteLead, isLeadStatus, leadById, LEAD_STATUS_LABEL, setLeadStatus } from '@/lib/leads';
import { exec } from '@/lib/db';

export async function leadOpAction(form: FormData) {
  const user = await requireUser();
  const op = String(form.get('op') ?? '');
  const id = Number(form.get('id') ?? 0);
  const back = safeBack(form.get('back'), adminUrl('leads'));
  await requireCsrf(form, back);

  try {
    const lead = await leadById(id);
    if (!lead) {
      await setFlash({ err: 'That lead no longer exists.' });
      redirect(adminUrl('leads'));
    }

    if (op === 'status') {
      const status = String(form.get('status') ?? '');
      if (!isLeadStatus(status)) {
        await setFlash({ err: 'Choose a status from the list.' });
      } else if (status === lead.status) {
        await setFlash({ ok: `${lead.name || lead.email} is already ${LEAD_STATUS_LABEL[status].toLowerCase()}.` });
      } else {
        await setLeadStatus(id, status);
        await setFlash({ ok: `${lead.name || lead.email} moved to ${LEAD_STATUS_LABEL[status]}.` });
      }
    } else if (op === 'note') {
      const note = String(form.get('note') ?? '').trim();
      if (!note) await setFlash({ err: 'Write the note before adding it.' });
      else if (note.length > 5000) await setFlash({ err: 'Keep a note under 5,000 characters.' });
      else {
        await addLeadNote(id, `${note}\n— ${brandText(user.name)}`);
        await setFlash({ ok: 'Note added.' });
      }
    } else if (op === 'delete_note') {
      const noteId = Number(form.get('note_id') ?? 0);
      const res = await exec('DELETE FROM vx_lead_notes WHERE id = ? AND lead_id = ?', [noteId, id]);
      await setFlash(res.affectedRows ? { ok: 'Note deleted.' } : { err: 'That note no longer exists.' });
    } else if (op === 'delete') {
      await deleteLead(id);
      await setFlash({ ok: `Lead from ${lead.name || lead.email} deleted, with its notes.` });
      redirect(safeBack(form.get('after_delete'), adminUrl('leads')));
    }
  } catch (e) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    await setFlash({ err: 'That action could not be completed: ' + String(e) });
  }
  redirect(back);
}
