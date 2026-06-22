'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, message }),
      });

      if (!res.ok) throw new Error();
      setStatus('success');
      setNom('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-900 dark:bg-green-950">
        <p className="text-lg font-bold text-green-800 dark:text-green-200">
          Message envoyé !
        </p>
        <p className="mt-2 text-sm text-green-700 dark:text-green-300">
          On vous répondra dans les plus brefs délais.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-black text-white transition hover:opacity-90"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {status === 'error' && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Une erreur est survenue. Réessayez ou écrivez directement à contact@menmatarlmatar.ma.
        </p>
      )}
      <div className="grid gap-2">
        <label className="text-sm font-bold" htmlFor="nom">
          Nom
        </label>
        <input
          id="nom"
          type="text"
          required
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Votre nom"
          className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-bold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
        />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-bold" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Votre message..."
          rows={5}
          className="resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-primary transition focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-full bg-primary px-6 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {status === 'loading' ? 'Envoi…' : 'Envoyer le message'}
      </button>
    </form>
  );
}
