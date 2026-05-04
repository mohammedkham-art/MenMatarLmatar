'use client';

type DeleteCountryButtonProps = {
  action: (formData: FormData) => Promise<void>;
  countryId: string;
  countryName: string;
};

export function DeleteCountryButton({
  action,
  countryId,
  countryName,
}: DeleteCountryButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer ${countryName} ?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={countryId} />
      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
      >
        Supprimer
      </button>
    </form>
  );
}
