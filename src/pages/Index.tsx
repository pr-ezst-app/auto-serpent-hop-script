import { useState } from 'react';
import Icon from '@/components/ui/icon';

const SCRIPT = `loadstring(game:HttpGet("https://raw.githubusercontent.com/NTT-HUB/Script/refs/heads/main/main"))()`;

type Tab = 'home' | 'farm' | 'fruit' | 'teleport' | 'combat' | 'dungeon' | 'settings';

type Toggle = {
  id: string;
  label: string;
  desc: string;
  on: boolean;
};

const SECTIONS: Record<string, { label: string; icon: string; color: string }> = {
  home:     { label: 'HOME',     icon: 'Home',        color: '#00ff88' },
  farm:     { label: 'FARM',     icon: 'Cpu',         color: '#60a5fa' },
  fruit:    { label: 'FRUIT',    icon: 'Zap',         color: '#f97316' },
  teleport: { label: 'TELEPORT', icon: 'Navigation',  color: '#a78bfa' },
  combat:   { label: 'COMBAT',   icon: 'Sword',       color: '#ff3b5c' },
  dungeon:  { label: 'DUNGEON',  icon: 'Shield',      color: '#fbbf24' },
  settings: { label: 'SETTINGS', icon: 'Settings',    color: '#94a3b8' },
};

const FARM_TOGGLES: Toggle[] = [
  { id: 'auto_farm',     label: 'Auto Farm',          desc: 'Kills mobs automatically',           on: false },
  { id: 'auto_quest',    label: 'Auto Quest',         desc: 'Accepts & completes quests',         on: false },
  { id: 'auto_eat',      label: 'Auto Eat',           desc: 'Eats food to restore HP',            on: false },
  { id: 'auto_race',     label: 'Auto Race V4',       desc: 'Completes race awakening trials',    on: false },
  { id: 'mob_esp',       label: 'Mob ESP',            desc: 'Shows mobs through walls',           on: false },
  { id: 'inf_energy',    label: 'Inf Energy',         desc: 'Infinite stamina/energy',            on: false },
];

const FRUIT_TOGGLES: Toggle[] = [
  { id: 'serpent_hop',   label: 'Serpent Sniper',     desc: 'Auto-hops servers for Serpent fruit',on: false },
  { id: 'fruit_notif',   label: 'Fruit Notifier',     desc: 'Alert when rare fruit spawns',       on: false },
  { id: 'auto_storage',  label: 'Auto Storage',       desc: 'Stores fruit automatically',         on: false },
  { id: 'fruit_esp',     label: 'Fruit ESP',          desc: 'See all fruits on the map',          on: false },
  { id: 'auto_pick',     label: 'Auto Pick Fruit',    desc: 'Picks fruits on spawn',              on: false },
];

const TELEPORT_LOCATIONS = [
  { name: 'Starter Island',   icon: '🏝️' },
  { name: 'Marine Base',      icon: '⚓' },
  { name: 'Skypiea',          icon: '☁️' },
  { name: 'Snow Island',      icon: '❄️' },
  { name: 'Logue Town',       icon: '🏙️' },
  { name: 'Enies Lobby',      icon: '⚖️' },
  { name: 'Thriller Bark',    icon: '💀' },
  { name: 'Marineford',       icon: '🌊' },
  { name: 'Punk Hazard',      icon: '🔥' },
  { name: 'Dressrosa',        icon: '⚔️' },
  { name: 'Zou',              icon: '🐘' },
  { name: 'Wano',             icon: '🎋' },
];

const COMBAT_TOGGLES: Toggle[] = [
  { id: 'auto_parry',    label: 'Auto Parry',         desc: 'Blocks attacks automatically',       on: false },
  { id: 'no_cooldown',   label: 'No Cooldown',        desc: 'Removes skill cooldowns',            on: false },
  { id: 'kill_aura',     label: 'Kill Aura',          desc: 'Hits nearby enemies',                on: false },
  { id: 'auto_haki',     label: 'Auto Haki',          desc: 'Activates haki automatically',       on: false },
  { id: 'tp_kill',       label: 'TP Kill',            desc: 'Teleports to player & attacks',      on: false },
  { id: 'no_clip',       label: 'No Clip',            desc: 'Walk through walls',                 on: false },
];

const DUNGEON_TOGGLES: Toggle[] = [
  { id: 'auto_dungeon',  label: 'Auto Dungeon',       desc: 'Clears dungeons automatically',      on: false },
  { id: 'boss_farm',     label: 'Boss Farm',          desc: 'Farms bosses for drops',             on: false },
  { id: 'auto_raid',     label: 'Auto Raid',          desc: 'Joins and completes raids',          on: false },
  { id: 'skip_cutscene', label: 'Skip Cutscenes',     desc: 'Skips all cutscenes',                on: false },
];

function ToggleRow({
  toggle,
  onToggle,
}: {
  toggle: Toggle;
  onToggle: (id: string) => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl transition-all"
      style={{
        background: toggle.on ? 'rgba(0,255,136,0.07)' : 'var(--panel-3)',
        border: `1px solid ${toggle.on ? 'var(--neon)' : 'var(--border-c)'}`,
      }}
    >
      <div>
        <div className="text-sm font-bold" style={{ color: toggle.on ? 'var(--neon)' : '#e8eaf0', fontFamily: 'Syne' }}>
          {toggle.label}
        </div>
        <div className="text-xs font-mono-app" style={{ color: 'var(--text-dim)' }}>{toggle.desc}</div>
      </div>
      <label className="toggle-switch flex-shrink-0">
        <input type="checkbox" checked={toggle.on} onChange={() => onToggle(toggle.id)} />
        <span className="toggle-track" />
      </label>
    </div>
  );
}

export default function Index() {
  const [tab, setTab] = useState<Tab>('home');
  const [copied, setCopied] = useState(false);
  const [farmToggles, setFarmToggles] = useState(FARM_TOGGLES);
  const [fruitToggles, setFruitToggles] = useState(FRUIT_TOGGLES);
  const [combatToggles, setCombatToggles] = useState(COMBAT_TOGGLES);
  const [dungeonToggles, setDungeonToggles] = useState(DUNGEON_TOGGLES);
  const [tpFeedback, setTpFeedback] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggle = (
    list: Toggle[],
    setList: React.Dispatch<React.SetStateAction<Toggle[]>>,
    id: string
  ) => {
    setList(prev => prev.map(t => t.id === id ? { ...t, on: !t.on } : t));
  };

  const handleTp = (name: string) => {
    setTpFeedback(name);
    setTimeout(() => setTpFeedback(null), 2000);
  };

  const activeCount =
    farmToggles.filter(t => t.on).length +
    fruitToggles.filter(t => t.on).length +
    combatToggles.filter(t => t.on).length +
    dungeonToggles.filter(t => t.on).length;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--panel)', fontFamily: 'Syne, sans-serif' }}>

      {/* TP Feedback toast */}
      {tpFeedback && (
        <div
          className="alert-in fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl font-mono-app text-sm font-bold"
          style={{
            background: 'var(--panel-2)',
            border: '1px solid #a78bfa',
            boxShadow: '0 0 24px rgba(167,139,250,0.4)',
            color: '#a78bfa',
          }}
        >
          <Icon name="Navigation" size={16} />
          Teleporting to {tpFeedback}…
        </div>
      )}

      {/* Sidebar */}
      <aside
        className="flex flex-col py-6 px-3 gap-1 flex-shrink-0"
        style={{
          width: 72,
          background: 'var(--panel-2)',
          borderRight: '1px solid var(--border-c)',
        }}
      >
        <div
          className="w-10 h-10 mx-auto mb-4 flex items-center justify-center rounded-xl text-xl"
          style={{ background: 'var(--neon-dim)', border: '1px solid var(--neon)' }}
        >
          🐍
        </div>
        {(Object.keys(SECTIONS) as Tab[]).map(key => {
          const s = SECTIONS[key];
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              title={s.label}
              className="w-full flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all"
              style={{
                background: active ? `${s.color}18` : 'transparent',
                border: `1px solid ${active ? s.color : 'transparent'}`,
              }}
            >
              <Icon name={s.icon} size={18} style={{ color: active ? s.color : 'var(--text-dim)' }} />
              <span className="text-[9px] font-bold tracking-widest" style={{ color: active ? s.color : 'var(--text-dim)', fontFamily: 'Space Mono' }}>
                {s.label.slice(0, 4)}
              </span>
            </button>
          );
        })}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <header
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-c)', background: 'var(--panel-2)' }}
        >
          <div>
            <div className="font-bold text-lg tracking-wide">
              NTT<span className="neon-text">HUB</span>
              <span className="ml-2 text-xs font-mono-app px-2 py-0.5 rounded" style={{ background: 'var(--neon-dim)', color: 'var(--neon)', border: '1px solid var(--neon)' }}>
                v190
              </span>
            </div>
            <div className="text-xs font-mono-app" style={{ color: 'var(--text-dim)' }}>King Legacy Script Hub</div>
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: 'var(--neon-dim)', border: '1px solid var(--neon)' }}>
                <div className="w-1.5 h-1.5 rounded-full dot-blink" style={{ background: 'var(--neon)' }} />
                <span className="font-mono-app text-xs neon-text font-bold">{activeCount} active</span>
              </div>
            )}
            <div className="text-xs font-mono-app px-3 py-1.5 rounded-full" style={{ background: 'var(--panel-3)', color: 'var(--text-dim)', border: '1px solid var(--border-c)' }}>
              {SECTIONS[tab].label}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* HOME */}
          {tab === 'home' && (
            <div className="max-w-2xl mx-auto space-y-6 slide-up">
              <div
                className="rounded-2xl p-8 text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,255,136,0.02))',
                  border: '1px solid var(--neon)',
                  boxShadow: '0 0 40px rgba(0,255,136,0.1)',
                }}
              >
                <div className="text-5xl mb-3">🐍</div>
                <div className="text-3xl font-bold mb-1">NTT<span className="neon-text">HUB</span></div>
                <div className="font-mono-app text-sm mb-1" style={{ color: 'var(--text-dim)' }}>Version 190 · King Legacy</div>
                <div className="font-mono-app text-xs" style={{ color: 'var(--text-dim)' }}>by NTT Obfuscator</div>
              </div>

              {/* Copy script */}
              <div className="glass-panel p-5 space-y-3">
                <div className="text-xs font-mono-app font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                  Execute Script
                </div>
                <div
                  className="rounded-lg px-4 py-3 font-mono-app text-xs break-all"
                  style={{ background: 'var(--panel-3)', border: '1px solid var(--border-c)', color: '#60a5fa' }}
                >
                  {SCRIPT}
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full py-3.5 rounded-xl font-bold text-base tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    background: copied ? 'rgba(0,255,136,0.15)' : 'rgba(0,255,136,0.08)',
                    border: `2px solid ${copied ? 'var(--neon)' : 'var(--neon)'}`,
                    color: 'var(--neon)',
                    boxShadow: copied ? '0 0 30px rgba(0,255,136,0.3)' : '0 0 16px rgba(0,255,136,0.15)',
                  }}
                >
                  <Icon name={copied ? 'Check' : 'Copy'} size={18} />
                  {copied ? 'COPIED!' : 'COPY SCRIPT'}
                </button>
                <p className="text-xs font-mono-app text-center" style={{ color: 'var(--text-dim)' }}>
                  Paste in your Roblox executor (Solara, Wave, Ronin…)
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Features',  value: '20+',  color: 'var(--neon)',    icon: 'Star' },
                  { label: 'Supported', value: 'All Executors', color: '#60a5fa', icon: 'Monitor' },
                  { label: 'Game',      value: 'King Legacy', color: '#f97316', icon: 'Gamepad2' },
                  { label: 'Status',    value: 'UNDETECTED', color: '#a78bfa', icon: 'ShieldCheck' },
                ].map((s, i) => (
                  <div key={i} className="glass-panel p-4 flex items-center gap-3">
                    <Icon name={s.icon} size={20} style={{ color: s.color }} />
                    <div>
                      <div className="text-xs font-mono-app" style={{ color: 'var(--text-dim)' }}>{s.label}</div>
                      <div className="font-bold text-sm" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FARM */}
          {tab === 'farm' && (
            <div className="max-w-xl mx-auto space-y-3 slide-up">
              <div className="text-xs font-mono-app font-bold uppercase tracking-widest mb-4" style={{ color: '#60a5fa' }}>
                Farm Options
              </div>
              {farmToggles.map(t => (
                <ToggleRow key={t.id} toggle={t} onToggle={id => toggle(farmToggles, setFarmToggles, id)} />
              ))}
            </div>
          )}

          {/* FRUIT */}
          {tab === 'fruit' && (
            <div className="max-w-xl mx-auto space-y-3 slide-up">
              <div className="text-xs font-mono-app font-bold uppercase tracking-widest mb-4" style={{ color: '#f97316' }}>
                Fruit / Serpent Options
              </div>
              {fruitToggles.map(t => (
                <ToggleRow key={t.id} toggle={t} onToggle={id => toggle(fruitToggles, setFruitToggles, id)} />
              ))}

              {/* Pattern info */}
              <div
                className="rounded-xl p-4 mt-4"
                style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.3)' }}
              >
                <div className="text-xs font-mono-app font-bold mb-2" style={{ color: '#f97316' }}>
                  Serpent Hop Pattern
                </div>
                <div className="flex flex-wrap gap-2">
                  {['1:31','3:02','4:33','6:04','7:35','9:06','…'].map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded font-mono-app text-xs"
                      style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.4)', color: '#f97316' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TELEPORT */}
          {tab === 'teleport' && (
            <div className="max-w-2xl mx-auto slide-up">
              <div className="text-xs font-mono-app font-bold uppercase tracking-widest mb-4" style={{ color: '#a78bfa' }}>
                Teleport Locations
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TELEPORT_LOCATIONS.map(loc => (
                  <button
                    key={loc.name}
                    onClick={() => handleTp(loc.name)}
                    className="rounded-xl px-4 py-4 text-left transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'var(--panel-3)',
                      border: '1px solid var(--border-c)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#a78bfa';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(167,139,250,0.08)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-c)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--panel-3)';
                    }}
                  >
                    <div className="text-2xl mb-1">{loc.icon}</div>
                    <div className="text-sm font-bold" style={{ color: '#e8eaf0', fontFamily: 'Syne' }}>{loc.name}</div>
                    <div className="text-xs font-mono-app mt-0.5 flex items-center gap-1" style={{ color: '#a78bfa' }}>
                      <Icon name="Navigation" size={10} />
                      Teleport
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* COMBAT */}
          {tab === 'combat' && (
            <div className="max-w-xl mx-auto space-y-3 slide-up">
              <div className="text-xs font-mono-app font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--danger)' }}>
                Combat Options
              </div>
              {combatToggles.map(t => (
                <ToggleRow key={t.id} toggle={t} onToggle={id => toggle(combatToggles, setCombatToggles, id)} />
              ))}
            </div>
          )}

          {/* DUNGEON */}
          {tab === 'dungeon' && (
            <div className="max-w-xl mx-auto space-y-3 slide-up">
              <div className="text-xs font-mono-app font-bold uppercase tracking-widest mb-4" style={{ color: '#fbbf24' }}>
                Dungeon & Boss Options
              </div>
              {dungeonToggles.map(t => (
                <ToggleRow key={t.id} toggle={t} onToggle={id => toggle(dungeonToggles, setDungeonToggles, id)} />
              ))}
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-5 slide-up">
              <div className="text-xs font-mono-app font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-dim)' }}>
                Hub Settings
              </div>

              <div className="glass-panel p-5 space-y-4">
                <div className="text-sm font-bold neon-text" style={{ fontFamily: 'Syne' }}>Notifications</div>
                {[
                  { label: 'Sound Alert on Fruit Spawn', desc: 'Plays sound when rare fruit appears' },
                  { label: 'Discord Webhook Notify',     desc: 'Sends alert to Discord on detection' },
                  { label: 'Auto-Stop on Serpent Found', desc: 'Stops hopping when serpent detected' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm" style={{ color: '#e8eaf0' }}>{label}</div>
                      <div className="text-xs font-mono-app" style={{ color: 'var(--text-dim)' }}>{desc}</div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-track" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="glass-panel p-5 space-y-3">
                <div className="text-sm font-bold neon-text" style={{ fontFamily: 'Syne' }}>Player</div>
                <div>
                  <div className="text-xs font-mono-app mb-1.5" style={{ color: 'var(--text-dim)' }}>Roblox Username</div>
                  <input
                    type="text"
                    placeholder="Your username..."
                    className="w-full rounded-lg px-3 py-2.5 text-sm font-mono-app outline-none"
                    style={{ background: 'var(--panel-3)', border: '1px solid var(--border-c)', color: 'var(--neon)' }}
                  />
                </div>
                <div>
                  <div className="text-xs font-mono-app mb-1.5" style={{ color: 'var(--text-dim)' }}>Discord Webhook URL</div>
                  <input
                    type="text"
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full rounded-lg px-3 py-2.5 text-sm font-mono-app outline-none"
                    style={{ background: 'var(--panel-3)', border: '1px solid var(--border-c)', color: '#e8eaf0' }}
                  />
                </div>
              </div>

              <button
                className="w-full py-3.5 rounded-xl font-bold text-base tracking-wider transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(0,255,136,0.08)',
                  border: '2px solid var(--neon)',
                  color: 'var(--neon)',
                  boxShadow: '0 0 20px rgba(0,255,136,0.15)',
                  fontFamily: 'Syne',
                }}
              >
                SAVE SETTINGS
              </button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
