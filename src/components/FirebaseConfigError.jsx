export default function FirebaseConfigError({ missingKeys }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">Firebase não configurado</h1>
        <p className="mt-2 text-sm text-slate-600">
          A aplicação em produção não tem as variáveis de ambiente do Firebase. Sem o{' '}
          <code className="rounded bg-slate-100 px-1">projectId</code>, o Firestore gera caminhos
          inválidos e nada é guardado.
        </p>
        <p className="mt-3 text-sm font-medium text-slate-800">Em falta:</p>
        <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
          {missingKeys.map((key) => (
            <li key={key}>
              <code>{key}</code>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600">
          No Vercel: <strong>Project → Settings → Environment Variables</strong>. Copie os valores de{' '}
          <code className="rounded bg-slate-100 px-1">.env.local</code>, marque Production (e
          Preview se quiser), depois faça <strong>Redeploy</strong> — o Vite só lê{' '}
          <code className="rounded bg-slate-100 px-1">VITE_*</code> no build.
        </p>
      </div>
    </div>
  );
}
