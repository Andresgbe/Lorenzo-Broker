import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../entities/session';
import { useSiteContentField } from '../../entities/site-content';
import { Container } from '../../shared/ui/Container';
import { SectionHeading } from '../../shared/ui/SectionHeading';
import { Button } from '../../shared/ui/Button';
import { MediaPlaceholder } from '../../shared/ui/MediaPlaceholder';
import { EXTERNAL_LINKS } from '../../shared/config/external-links';
import { cn } from '../../shared/lib/cn';

interface Channel {
  id: string;
  label: string;
  locked: boolean;
  description: string;
}

interface ChannelGroup {
  category: string;
  channels: Channel[];
}

const DEFAULT_SERVER_NAME = 'LORENZO BROKER';

const DEFAULT_CHANNEL_GROUPS: ChannelGroup[] = [
  {
    category: 'Lorenzo escribe aquí',
    channels: [
      {
        id: 'senales-swing',
        label: 'señales-swing',
        locked: false,
        description: 'Señales de compra y venta swing con entrada, salida y tesis, y registro público de resultados.',
      },
      {
        id: 'pre-market',
        label: 'pre-market',
        locked: false,
        description: 'Todos los días antes de la campana: los tickers en mi radar, niveles clave y escenarios.',
      },
      {
        id: 'noticias-del-dia',
        label: 'noticias-del-dia',
        locked: false,
        description: 'Las noticias y catalizadores que mueven el mercado hoy, resumidos y explicados en simple.',
      },
      { id: 'trade-recaps', label: 'trade-recaps', locked: true, description: '' },
      { id: 'links-zoom-en-vivo', label: 'links-zoom-en-vivo', locked: true, description: '' },
    ],
  },
  {
    category: 'Eventos',
    channels: [
      { id: 'webinar-mensual', label: 'webinar-mensual', locked: true, description: '' },
      { id: 'preguntas-qa', label: 'preguntas-qa', locked: true, description: '' },
    ],
  },
  {
    category: 'Educación',
    channels: [
      { id: 'libreria-cursos', label: 'libreria-cursos', locked: true, description: '' },
      { id: 'libros-pdf', label: 'libros-pdf', locked: true, description: '' },
      { id: 'repeticiones', label: 'repeticiones', locked: true, description: '' },
    ],
  },
  {
    category: 'Bonus',
    channels: [{ id: 'copytrading-binance', label: 'copytrading-binance', locked: true, description: '' }],
  },
];

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2a4 4 0 0 0-4 4v3H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4Zm-2 7V6a2 2 0 1 1 4 0v3Z" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 15l-5-5-9 9" />
    </svg>
  );
}

function blurOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') event.currentTarget.blur();
}

export function CommunitySection() {
  const { isAuthenticated } = useAuth();
  const { value: storedGroups, setValue: persistGroups, isLoading } = useSiteContentField(
    'community.channels',
    DEFAULT_CHANNEL_GROUPS
  );
  const {
    value: storedServerName,
    setValue: persistServerName,
    isLoading: isServerNameLoading,
  } = useSiteContentField('community.serverName', DEFAULT_SERVER_NAME);
  const [channelGroups, setChannelGroups] = useState(DEFAULT_CHANNEL_GROUPS);
  const [serverName, setServerName] = useState(DEFAULT_SERVER_NAME);
  const [selectedId, setSelectedId] = useState(DEFAULT_CHANNEL_GROUPS[0].channels[0].id);

  // Adjust local state during render when the stored content first arrives,
  // instead of in an effect — avoids an extra render pass.
  const [wasLoading, setWasLoading] = useState(true);
  if (wasLoading && !isLoading) {
    setWasLoading(false);
    setChannelGroups(storedGroups);
  }
  const [wasServerNameLoading, setWasServerNameLoading] = useState(true);
  if (wasServerNameLoading && !isServerNameLoading) {
    setWasServerNameLoading(false);
    setServerName(storedServerName);
  }

  const allChannels = channelGroups.flatMap((group) => group.channels);
  const selected = allChannels.find((ch) => ch.id === selectedId) ?? allChannels[0];

  function updateChannel(id: string, patch: Partial<Channel>) {
    setChannelGroups((prev) =>
      prev.map((group) => ({
        ...group,
        channels: group.channels.map((ch) => (ch.id === id ? { ...ch, ...patch } : ch)),
      }))
    );
  }

  function saveChannels() {
    persistGroups(channelGroups);
  }

  function toggleLock(id: string) {
    setChannelGroups((prev) => {
      const next = prev.map((group) => ({
        ...group,
        channels: group.channels.map((ch) => (ch.id === id ? { ...ch, locked: !ch.locked } : ch)),
      }));
      persistGroups(next);
      return next;
    });
  }

  return (
    <section className="py-24 bg-bg-2 border-y border-line">
      <Container>
        <SectionHeading eyebrow="La comunidad" title={<>¿Qué hay dentro de <span className="text-accent">mi Discord</span>?</>} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mt-16 grid grid-cols-1 lg:grid-cols-[280px_1fr] bg-panel border border-line rounded-[20px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        >
          <aside className="bg-bg-2 border-b lg:border-b-0 lg:border-r border-line px-5 py-6">
            <div className="flex items-center gap-2.5 font-bold text-sm tracking-[0.6px] pb-4 border-b border-line mb-4">
              <span className="w-[26px] h-[26px] rounded-lg bg-accent/10 flex items-center justify-center text-[13px] shrink-0">📊</span>
              {isAuthenticated ? (
                <input
                  value={serverName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setServerName(e.target.value)}
                  onBlur={() => persistServerName(serverName)}
                  onKeyDown={blurOnEnter}
                  className="flex-1 min-w-0 bg-transparent outline-none border-b border-dashed border-line focus:border-accent uppercase"
                />
              ) : (
                serverName
              )}
            </div>
            {channelGroups.map((group) => (
              <div key={group.category}>
                <div className="text-[10.5px] font-bold tracking-[2px] text-muted uppercase mt-5 mb-2">
                  {group.category}
                </div>
                {group.channels.map((ch) => {
                  const isSelected = ch.id === selectedId;

                  if (isAuthenticated) {
                    return (
                      <div
                        key={ch.id}
                        className={cn(
                          'flex items-center gap-1.5 w-full text-sm px-2 py-1.5 rounded-lg transition-colors',
                          isSelected ? 'text-accent bg-accent/10' : 'text-[#aab4c5]'
                        )}
                      >
                        <span className="text-[#5b6577] font-semibold shrink-0">#</span>
                        <input
                          value={ch.label}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => updateChannel(ch.id, { label: e.target.value })}
                          onFocus={() => setSelectedId(ch.id)}
                          onBlur={saveChannels}
                          onKeyDown={blurOnEnter}
                          className="flex-1 min-w-0 bg-transparent outline-none border-b border-dashed border-line focus:border-accent"
                        />
                        <button
                          type="button"
                          onClick={() => toggleLock(ch.id)}
                          aria-label={ch.locked ? 'Desbloquear canal' : 'Bloquear canal'}
                          className="shrink-0 cursor-pointer"
                        >
                          <LockIcon className={cn('w-3.5 h-3.5', ch.locked ? 'fill-[#5b6577]' : 'fill-accent')} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedId(ch.id)}
                      className={cn(
                        'flex items-center justify-between gap-2 w-full text-left text-sm px-2 py-1.5 rounded-lg text-[#aab4c5] cursor-pointer transition-colors hover:text-ink',
                        isSelected && 'text-accent bg-accent/10 hover:text-accent'
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-[#5b6577] font-semibold">#</span> {ch.label}
                      </span>
                      {ch.locked && <LockIcon className="w-3.5 h-3.5 fill-[#5b6577] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>

          <div className="px-6 py-9 lg:px-10 h-full flex items-center">
            <AnimatePresence mode="wait">
              {!selected.locked ? (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <MediaPlaceholder
                    icon={<ImageIcon className="w-6 h-6 text-ink-inverse" />}
                    label="Captura próximamente"
                    className="aspect-video w-full rounded-xl mb-6"
                  />
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-2 text-[15px] font-bold tracking-[1.2px] uppercase text-ink">
                        <span className="text-accent">#</span>
                        <input
                          value={selected.label}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => updateChannel(selected.id, { label: e.target.value })}
                          onBlur={saveChannels}
                          onKeyDown={blurOnEnter}
                          className="flex-1 min-w-0 bg-transparent outline-none border-b border-dashed border-line focus:border-accent"
                        />
                      </div>
                      <textarea
                        value={selected.description}
                        onChange={(e) => updateChannel(selected.id, { description: e.target.value })}
                        onBlur={saveChannels}
                        placeholder="Escribe la descripción de este canal…"
                        rows={3}
                        className="w-full mt-2 bg-transparent outline-none resize-none text-muted text-[15px] placeholder:text-muted/50 border border-dashed border-line focus:border-accent rounded-lg p-2 -mx-2"
                      />
                    </>
                  ) : (
                    <>
                      <h4 className="flex items-center gap-2 text-[15px] font-bold tracking-[1.2px] uppercase text-ink">
                        <span className="text-accent">#</span> {selected.label}
                      </h4>
                      <p className="text-muted text-[15px] mt-2">{selected.description}</p>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key={selected.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full flex flex-col items-center text-center gap-4 py-6"
                >
                  <span className="flex items-center justify-center w-14 h-14 rounded-full bg-panel-2 border border-line">
                    <LockIcon className="w-6 h-6 fill-muted" />
                  </span>
                  <div>
                    <h4 className="text-[15px] font-bold uppercase tracking-[1.2px] text-ink">
                      #{selected.label} está bloqueado
                    </h4>
                    <p className="text-muted text-[15px] mt-2 max-w-sm">
                      Únete a la comunidad en Discord para desbloquear este canal.
                    </p>
                  </div>
                  <Button href={EXTERNAL_LINKS.discordInvite} variant="primary">
                    Únete a Discord
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
