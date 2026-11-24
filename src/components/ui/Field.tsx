import type { ComponentProps, ReactNode } from "react";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-status-notmet">
      {message}
    </p>
  );
}

const control =
  "mt-1.5 block w-full rounded-2xl border border-line bg-paper px-4 py-3 text-base text-ink transition-colors placeholder:text-muted hover:border-ink/40 focus:border-brand-blue aria-[invalid=true]:border-status-notmet disabled:bg-surface disabled:text-muted";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

function describedBy(id: string, hint?: string, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function TextField({ id, label, hint, error, ...props }: FieldProps & ComponentProps<"input">) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <input id={id} className={control} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...props} />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function SelectField({ id, label, hint, error, children, ...props }: FieldProps & ComponentProps<"select">) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <select id={id} className={control} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...props}>
        {children}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function Fieldset({ legend, hint, error, id, children }: { legend: string; hint?: string; error?: string; id: string; children: ReactNode }) {
  return (
    <fieldset aria-describedby={describedBy(id, hint, error)}>
      <legend className="text-sm font-semibold">{legend}</legend>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-muted">
          {hint}
        </p>
      )}
      <div className="mt-2 grid gap-2">{children}</div>
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  );
}

export function Choice({ label, hint, ...props }: { label: string; hint?: string } & ComponentProps<"input">) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5 transition-colors duration-200 hover:border-brand-blue/50 has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
      <input className="mt-1 size-4 accent-brand-blue" {...props} />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function ErrorSummary({ errors, labels }: { errors: Record<string, string>; labels?: Record<string, string> }) {
  const entries = Object.entries(errors);
  if (entries.length === 0) return null;
  return (
    <div role="alert" tabIndex={-1} className="animate-drop rounded-2xl border border-status-notmet bg-status-notmet-bg p-4">
      <p className="font-semibold text-status-notmet">Please check {entries.length === 1 ? "this answer" : "these answers"}</p>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {entries.map(([k, v]) => (
          <li key={k}>{labels?.[k] ? `${labels[k]}: ${v}` : v}</li>
        ))}
      </ul>
    </div>
  );
}
