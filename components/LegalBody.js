import { useLang } from '../lib/i18n';
import { useTranslated } from '../lib/autoTranslate';

// Rend un texte légal éditable (markdown léger) : "## titre", "- puce", lignes = paragraphes.
// Traduit automatiquement vers AR/EN si l'admin n'a pas fourni la version dans cette langue.
export default function LegalBody({ bodyFr, bodyLang }) {
  const { lang } = useLang();
  const trFromFr = useTranslated(bodyFr || '');
  const source = lang === 'fr' ? (bodyFr || '') : ((bodyLang && bodyLang.trim()) ? bodyLang : trFromFr);

  const lines = String(source || '').split('\n');
  const blocks = [];
  let list = [];
  const flush = () => { if (list.length) { blocks.push({ t: 'ul', items: [...list] }); list = []; } };

  lines.forEach((raw) => {
    const line = raw.trim();
    if (line.startsWith('## ')) { flush(); blocks.push({ t: 'h2', text: line.slice(3) }); }
    else if (line.startsWith('- ')) { list.push(line.slice(2)); }
    else if (line === '') { flush(); }
    else { flush(); blocks.push({ t: 'p', text: line }); }
  });
  flush();

  return (
    <div className="legal-content space-y-4">
      {blocks.map((b, i) => {
        if (b.t === 'h2') return <h2 key={i}>{b.text}</h2>;
        if (b.t === 'ul') return <ul key={i}>{b.items.map((x, j) => <li key={j}>{x}</li>)}</ul>;
        return <p key={i}>{b.text}</p>;
      })}
      <style jsx global>{`
        .legal-content h2 { color: #e9b949; font-size: 1.05rem; font-weight: 700; margin-top: 1.4rem; margin-bottom: .4rem; }
        .legal-content p, .legal-content li { color: rgba(255,255,255,.55); font-size: .95rem; line-height: 1.7; }
        .legal-content ul { list-style: disc; padding-left: 1.3rem; }
        .legal-content li { margin-bottom: .35rem; }
      `}</style>
    </div>
  );
}
