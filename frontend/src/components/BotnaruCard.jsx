import { useLang } from '../LanguageContext.jsx';

function highlight(text) {
  return text.split('Botnaru').reduce((acc, part, i) => {
    if (i === 0) return [part];
    return [
      ...acc,
      <strong key={i} style={{ color: '#a78bfa', fontWeight: 700 }}>Botnaru</strong>,
      part,
    ];
  }, []);
}

export default function BotnaruCard() {
  const { t } = useLang();

  return (
    <div
      className="card p-6 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6"
      style={{ borderLeft: '4px solid #a78bfa' }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 flex justify-center">
        <img
          src="/botnaru.png"
          alt="Botnaru"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full shadow-md object-cover object-center"
          style={{ border: '4px solid #a78bfa' }}
        />
      </div>

      {/* Texte */}
      <div className="flex flex-col gap-3 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
          <h3 className="text-xl md:text-2xl font-black leading-snug" style={{ color: 'var(--text)' }}>
            {highlight(t('botnaru.card.title'))}
          </h3>
          <span style={{
            fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
            background: 'rgba(167,139,250,0.18)', color: '#a78bfa',
            border: '1px solid rgba(167,139,250,0.4)', letterSpacing: '.04em', flexShrink: 0,
          }}>
            IA
          </span>
        </div>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {highlight(t('botnaru.card.p1'))}
        </p>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {highlight(t('botnaru.card.p2'))}
        </p>

        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {highlight(t('botnaru.card.p3'))}
        </p>

        <p className="text-sm font-bold" style={{ color: '#a78bfa' }}>
          {t('botnaru.card.cta')}
        </p>
      </div>
    </div>
  );
}
