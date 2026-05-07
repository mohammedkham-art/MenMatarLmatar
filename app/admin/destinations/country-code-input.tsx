'use client';

import { useState } from 'react';

import { countriesIso } from '@/data/countries-iso';

type CountryCodeInputProps = {
  defaultValue?: string;
};

export function CountryCodeInput({ defaultValue }: CountryCodeInputProps) {
  const [code, setCode] = useState(defaultValue?.toUpperCase() ?? '');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.toUpperCase().slice(0, 2);
    setCode(value);

    if (value.length === 2) {
      const country = countriesIso[value];
      if (!country) return;

      const form = e.target.closest('form');
      if (!form) return;

      const nameInput = form.querySelector<HTMLInputElement>('[name="name"]');
      if (nameInput && !nameInput.value) {
        nameInput.value = country.name;
      }

      const regionSelect = form.querySelector<HTMLSelectElement>('[name="region"]');
      if (regionSelect && !regionSelect.value) {
        regionSelect.value = country.region;
      }
    }
  }

  return (
    <div>
      <label
        htmlFor="code"
        className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
      >
        Code pays
      </label>
      <input
        id="code"
        name="code"
        type="text"
        placeholder="AR"
        value={code}
        onChange={handleChange}
        maxLength={2}
        className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-sm uppercase outline-none transition placeholder:text-muted-foreground focus:border-primary"
        required
      />
    </div>
  );
}
