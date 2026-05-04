'use client';

type DeleteDealButtonProps = {
  action: (formData: FormData) => Promise<void>;
  dealId: string;
};

export function DeleteDealButton({ action, dealId }: DeleteDealButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm('Supprimer cette offre ?')) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={dealId} />
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
      >
        Delete
      </button>
    </form>
  );
}
