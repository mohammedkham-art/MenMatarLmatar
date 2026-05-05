type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === 'missing-config') {
    return 'ADMIN_PASSWORD manque dans les variables d’environnement.';
  }

  if (error === 'invalid-password') {
    return 'Mot de passe incorrect.';
  }

  return null;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Entre le mot de passe admin pour accéder au centre de contrôle.
        </p>

        {errorMessage && (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </p>
        )}

        <form
          action="/admin/login/submit"
          className="mt-6 grid gap-4"
          method="post"
        >
          <label
            className="grid gap-2 text-sm font-semibold"
            htmlFor="password"
          >
            Mot de passe
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-12 rounded-xl border bg-background px-4 text-base outline-none transition focus:border-primary"
              required
            />
          </label>

          <button
            type="submit"
            className="h-12 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Entrer
          </button>
        </form>
      </section>
    </main>
  );
}
