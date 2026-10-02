import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { validateUser } from '../models/userModel';

const inputCls =
  'w-full rounded-xl border border-[#EADDD3] bg-white px-4 py-2.5 text-[14.5px] text-[#2B1A22] outline-none focus:border-[#B51B4D] focus:ring-[3px] focus:ring-[#B51B4D]/15 transition placeholder:text-[#9B8490]';

/**
 * Selector / registro de usuaria con chips de perfil y borrado en línea.
 * El borrado usa el mismo patrón que el historial: confirmación dentro
 * de la tarjeta, sin diálogos del navegador.
 */
export function UserSelectOrRegister({ users = [], selectedUserId = null, onSelect, onCreate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const activeUser = users.find((u) => u.id === selectedUserId) || null;

  // Si cambia de perfil, se cierra la confirmación pendiente
  React.useEffect(() => {
    setConfirmingDelete(false);
  }, [selectedUserId]);

  const handleDelete = async () => {
    if (!activeUser) return;
    setDeleting(true);
    try {
      await onDelete?.(activeUser.id);
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateUser(form);
    setErrors(errors);
    if (!isValid) return;
    setSaving(true);
    try {
      const email = form.email.trim();
      const created = await onCreate({ name: form.name.trim(), ...(email ? { email } : { email: null }) });
      setForm({ name: '', email: '' });
      setShowForm(false);
      if (created?.id) onSelect?.(created.id);
    } finally {
      setSaving(false);
    }
  };

  const initials = (name) =>
    name?.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '·';

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-1">
        <div>
          <h3 className="font-display text-[19px] font-semibold tracking-tight text-[#2B1A22]">¿Para quién es este cálculo?</h3>
          <p className="text-[13.5px] text-[#715563] mt-1 leading-relaxed max-w-[46ch]">
            Elige un perfil para guardar el historial a su nombre. Si lo prefieres, calcula sin perfil.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="shrink-0 text-[13px] font-semibold px-3.5 py-2 rounded-full border border-[#EADDD3] text-[#2B1A22] hover:border-[#B51B4D]/40 hover:text-[#B51B4D] transition"
          aria-expanded={showForm}
        >
          {showForm ? 'Cerrar' : 'Nuevo perfil'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4" role="radiogroup" aria-label="Elegir perfil">
        <button
          type="button"
          role="radio"
          aria-checked={!selectedUserId}
          onClick={() => onSelect?.(null)}
          className={`inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border text-[13.5px] font-medium transition ${
            !selectedUserId
              ? 'bg-[#2B1A22] text-[#FFFAF6] border-[#2B1A22]'
              : 'bg-white text-[#715563] border-[#EADDD3] hover:border-[#2B1A22]/30 hover:text-[#2B1A22]'
          }`}
        >
          <span className={`grid place-items-center w-7 h-7 rounded-full text-[12px] font-bold ${!selectedUserId ? 'bg-white/15' : 'bg-[#F6E9E1]'}`}>✦</span>
          Sin perfil
        </button>
        {users.map((u) => {
          const active = u.id === selectedUserId;
          return (
            <button
              key={u.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect?.(u.id)}
              title={u.email || u.name}
              className={`inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border text-[13.5px] font-medium transition ${
                active
                  ? 'bg-[#B51B4D] text-white border-[#B51B4D] shadow-[0_10px_24px_-10px_rgba(181,27,77,.55)]'
                  : 'bg-white text-[#2B1A22] border-[#EADDD3] hover:border-[#B51B4D]/40'
              }`}
            >
              <span className={`grid place-items-center w-7 h-7 rounded-full text-[11px] font-bold ${active ? 'bg-white/20' : 'bg-[#FBE3EB] text-[#7A1032]'}`}>
                {initials(u.name)}
              </span>
              {u.name?.split(/\s+/)[0]}
            </button>
          );
        })}
      </div>
      {activeUser && (
        <div className={`mt-3 rounded-2xl border px-4 py-3 transition ${confirmingDelete ? 'border-[#B51B4D]/40 bg-[#FBE3EB]/40' : 'border-[#EADDD3]/70 bg-white'}`}>
          {!confirmingDelete ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] min-w-0">
                <span className="font-semibold text-[#2B1A22] block truncate">{activeUser.name}</span>
                <span className="text-[#9B8490] block truncate">{activeUser.email || 'Sin correo registrado'}</span>
              </p>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-[12.5px] font-medium px-3 py-1.5 rounded-full text-[#9B8490] hover:text-[#B51B4D] hover:bg-[#FBE3EB] transition"
              >
                Eliminar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[12.5px] text-[#7A1032] font-medium basis-full sm:basis-auto sm:flex-1">
                ¿Borrar el perfil de {activeUser.name?.split(/\s+/)[0]}? Su historial se conserva.
              </p>
              <span className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 sm:flex-none text-[12.5px] font-semibold px-3.5 py-1.5 rounded-full bg-[#B51B4D] text-white hover:bg-[#7A1032] disabled:opacity-50 disabled:cursor-wait transition text-center"
                >
                  {deleting ? 'Borrando…' : 'Sí, borrar'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  className="flex-1 sm:flex-none text-[12.5px] font-medium px-3 py-1.5 rounded-full border border-[#EADDD3] bg-white hover:border-[#2B1A22]/30 disabled:opacity-50 transition text-center"
                >
                  Conservar
                </button>
              </span>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 mt-5 pt-5 border-t border-dashed border-[#EADDD3]" noValidate>
          <div>
            <label className="block text-[13px] font-semibold text-[#2B1A22] mb-1.5" htmlFor="newName">Nombre</label>
            <input
              id="newName"
              className={inputCls}
              placeholder="Ej. Mariana López"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoComplete="name"
            />
            {errors.name && <p className="text-xs text-[#B51B4D] mt-1.5">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#2B1A22] mb-1.5" htmlFor="newEmail">Correo <span className="font-medium text-[#9B8490]">(opcional)</span></label>
            <input
              id="newEmail"
              className={inputCls}
              placeholder="mariana@ejemplo.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-[#B51B4D] mt-1.5">{errors.email}</p>}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-2 rounded-xl bg-[#17604A] text-white text-[14px] font-semibold py-2.5 hover:bg-[#0E4A37] disabled:opacity-50 transition"
          >
            {saving ? 'Guardando perfil…' : 'Guardar perfil'}
          </button>
        </form>
      )}
    </Card>
  );
}
