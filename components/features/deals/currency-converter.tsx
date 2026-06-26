'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  currencyCode: string;
  currencyName: string;
};

export function CurrencyConverter({ currencyCode, currencyName }: Props) {
  const [mad, setMad] = useState('1000');
  const [local, setLocal] = useState('');
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const lastChanged = useRef<'mad' | 'local'>('mad');

  useEffect(() => {
    if (currencyCode === 'MAD') {
      setRate(1);
      setLocal('1000');
      setLoading(false);
      return;
    }

    fetch(`https://open.er-api.com/v6/latest/MAD`)
      .then((r) => r.json())
      .then((data: { result?: string; rates?: Record<string, number> }) => {
        console.log('[CurrencyConverter] raw API response:', data);
        const r = data.rates?.[currencyCode];
        if (data.result === 'success' && r) {
          setRate(r);
          setLocal((1000 * r).toFixed(2));
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [currencyCode]);

  function handleMadChange(val: string) {
    lastChanged.current = 'mad';
    setMad(val);
    if (rate !== null && val !== '') {
      setLocal((parseFloat(val) * rate).toFixed(2));
    } else {
      setLocal('');
    }
  }

  function handleLocalChange(val: string) {
    lastChanged.current = 'local';
    setLocal(val);
    if (rate !== null && val !== '') {
      setMad((parseFloat(val) / rate).toFixed(2));
    } else {
      setMad('');
    }
  }

  const inputClass =
    'mt-2 w-full border-b bg-transparent pb-2 text-sm font-semibold text-white outline-none placeholder:font-normal placeholder:text-white/40 focus:border-white/60';

  return (
    <div className="rounded-2xl bg-primary p-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-white">
        Convertisseur
      </p>
      <p className="mt-1 text-lg font-bold text-white">
        MAD ↔ {currencyCode}
      </p>
      <p className="mt-0.5 text-xs text-white/60">{currencyName}</p>

      <div className="mt-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {loading ? (
        <div className="mt-6 flex justify-center">
          <span
            className="inline-block h-5 w-5 animate-spin rounded-full border-2"
            style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'white' }}
          />
        </div>
      ) : rate === null ? (
        <p className="mt-6 text-center text-xs text-white/50">
          Taux indisponible
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-white">
                MAD
              </label>
              <input
                type="number"
                min={0}
                value={mad}
                onChange={(e) => handleMadChange(e.target.value)}
                placeholder="1000"
                className={inputClass}
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-white">
                {currencyCode}
              </label>
              <input
                type="number"
                min={0}
                value={local}
                onChange={(e) => handleLocalChange(e.target.value)}
                placeholder="—"
                className={inputClass}
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              />
            </div>
          </div>

          <p className="mt-5 text-xs text-white/40">
            1 MAD = {rate.toFixed(4)} {currencyCode} · taux indicatif
          </p>
        </>
      )}
    </div>
  );
}
