import Header from "./Header";
import Footer from "./Footer";

export interface LegalBlock {
  title?: string;
  paragraphs?: string[];
  list?: string[];
  paragraphsAfter?: string[];
}

interface LegalPageProps {
  title: string;
  intro?: string;
  updated?: string;
  blocks: LegalBlock[];
}

export default function LegalPage({ title, intro, updated, blocks }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-14">
        <h1 className="mb-3 text-3xl font-extrabold gradient-text">{title}</h1>
        {updated && (
          <p className="mb-2 text-xs text-muted/50">Última actualización: {updated}</p>
        )}
        {intro && (
          <p className="mb-6 text-sm text-muted/80 leading-relaxed">{intro}</p>
        )}
        <div className="space-y-5">
          {blocks.map((b) => (
            <section key={b.title || b.paragraphs?.[0]} className="rounded-xl2 card-surface p-6">
              {b.title && (
                <h2 className="mb-3 text-lg font-bold tracking-tight">{b.title}</h2>
              )}
              {b.paragraphs?.map((t) => (
                <p key={t} className="mb-2 text-sm text-muted leading-relaxed last:mb-0">
                  {t}
                </p>
              ))}
              {b.list && (
                <ul className="mb-2 space-y-2">
                  {b.list.map((i) => (
                    <li key={i} className="text-sm text-muted leading-relaxed">
                      • {i}
                    </li>
                  ))}
                </ul>
              )}
              {b.paragraphsAfter?.map((t) => (
                <p key={t} className="mb-2 text-sm text-muted leading-relaxed last:mb-0">
                  {t}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}