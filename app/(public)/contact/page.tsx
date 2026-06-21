'use client';

import { useState } from 'react';

import { PublicFooter } from '@/components/shared/public-footer';
import { PublicHeader } from '@/components/shared/public-header';

export default function ContactPage() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact MML – ${nom}`);
    const body = encodeURIComponent(`Nom : ${nom}\nEmail : ${email}\n\n${message}`);
    window.location.href = `mailto:contact@menmatarlmatar.ma?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <main className="min-h-screen">
      <PublicHeader />
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight">Nous contacter</h1>
          <p className="mt-3 text-muted-foreground">
            Une question, une suggestion ou un partenariat ? Écrivez-nous.
          </p>
        </header>

        <div className="mt-10 max-w-xl">
          {sent ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-8 text-center dark:border-green-900 dark:bg-green-950">
              <p className="text-lg font-bold text-green-800 dark:text-green-200">
                Votre messagerie va s'ouvrir 📨
              </p>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                Envoyez le message pré-rempli depuis votre application email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-5">
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
                className="rounded-full bg-primary px-6 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md"
              >
                Envoyer le message
              </button>
            </form>
          )}
        </div>
      </div>
      <PublicFooter />
    </main>
  );
}
