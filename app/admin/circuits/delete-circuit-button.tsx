'use client';

type Props = {
  action: (formData: FormData) => Promise<void>;
  circuitId: string;
};

export function DeleteCircuitButton({ action, circuitId }: Props) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm('Supprimer ce circuit ?')) e.preventDefault();
      }}
    >
      <input name="id" type="hidden" value={circuitId} />
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
      >
        Delete
      </button>
    </form>
  );
}
