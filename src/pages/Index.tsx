import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

type Tab = 'dashboard' | 'settings';
type LogEntry = { id: number; time: string; message: string; type: 'info' | 'warn' | 'success' | 'danger' };

const PATTERN_BASE = 91;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function generatePattern(count: number, base: number): number[] {
  return Array.from({ length: count }, (_, i) => base * (i + 1));
}

const SERVERS = [
  'US-East-01', 'EU-West-12', 'AP-South-07', 'US-West-03',
  'EU-Central-09', 'AP-East-14', 'US-Central-02', 'SA-East-05',
];

export default function Index() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [hopCount, setHopCount] = useState(0);
  const [currentServer, setCurrentServer] = useState(SERVERS[0]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [alert, setAlert] = useState<string | null>(null);
  const [nextHopIn, setNextHopIn] = useState(PATTERN_BASE);
  const [totalSerpents, setTotalSerpents] = useState(0);
  const [settings, setSettings] = useState({
    soundAlert: true,
    discordNotify: false,
    autoStop: true,
    scanInterval: PATTERN_BASE,
    serpentChance: 4,
    maxHops: 50,
    discordWebhook: '',
    playerName: 'Player_01',
  });

  const logIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ elapsed: 0, hopCount: 0, nextTarget: PATTERN_BASE, patternIdx: 0 });
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
    setLogs(prev => [...prev.slice(-99), { id: ++logIdRef.current, time, message, type }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const s = stateRef.current;
    const pattern = generatePattern(settingsRef.current.maxHops, settingsRef.current.scanInterval);

    intervalRef.current = setInterval(() => {
      s.elapsed++;
      setElapsed(s.elapsed);
      setNextHopIn(Math.max(0, s.nextTarget - s.elapsed));

      if (s.elapsed >= s.nextTarget) {
        s.hopCount++;
        setHopCount(s.hopCount);
        const srv = SERVERS[s.hopCount % SERVERS.length];
        setCurrentServer(srv);
        addLog(`Hopped to ${srv} — scan #${s.hopCount} at ${formatTime(s.elapsed)}`, 'info');

        const roll = Math.random() * 100;
        if (roll < settingsRef.current.serpentChance) {
          setTotalSerpents(p => p + 1);
          setAlert(srv);
          addLog(`⚡ SERPENT FOUND on ${srv} — alert triggered!`, 'danger');
          if (settingsRef.current.autoStop) {
            setRunning(false);
          }
          setTimeout(() => setAlert(null), 5000);
        } else {
          addLog(`Clear — no serpent on ${srv}`, 'warn');
        }

        s.patternIdx++;
        s.nextTarget = pattern[s.patternIdx] ?? (s.nextTarget + settingsRef.current.scanInterval);

        if (s.hopCount >= settingsRef.current.maxHops) {
          setRunning(false);
          addLog('Max hops reached — script stopped', 'warn');
        }
      }
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, addLog]);

  const handleStart = () => {
    if (running) {
      setRunning(false);
      addLog('Script paused by user', 'warn');
    } else {
      setRunning(true);
      const p = generatePattern(5, settings.scanInterval);
      addLog(`Script started — pattern: ${p.map(formatTime).join(', ')}…`, 'success');
    }
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setHopCount(0);
    setNextHopIn(settings.scanInterval);
    setCurrentServer(SERVERS[0]);
    setLogs([]);
    setTotalSerpents(0);
    stateRef.current = { elapsed: 0, hopCount: 0, nextTarget: settings.scanInterval, patternIdx: 0 };
    addLog('Session reset', 'info');
  };

  const pattern = generatePattern(6, settings.scanInterval);
  const progressToNext = nextHopIn > 0
    ? ((settings.scanInterval - nextHopIn) / settings.scanInterval) * 100
    : 100;

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--panel)' }}>

      {/* Serpent Alert */}
      {alert && (
        <div
          className="alert-in fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl"
          style={{
            background: 'var(--panel-2)',
            border: '2px solid var(--danger)',
            boxShadow: '0 0 40px rgba(255,59,92,0.5)',
            color: '#fff',
            minWidth: 300,
            fontFamily: 'Space Mono, monospace',
          }}
        >
          <span className="text-2xl">🐍</span>
          <div>
            <div className="text-xs mb-0.5 font-bold" style={{ color: 'var(--danger)' }}>SERPENT DETECTED</div>
            <div className="text-sm font-bold">{alert}</div>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full dot-blink" style={{ background: 'var(--danger)' }} />
        </div>
      )}

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border-c)', background: 'var(--panel-2)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center rounded-lg text-lg"
            style={{ background: 'var(--neon-dim)', border: '1px solid var(--neon)' }}
          >
            🐍
          </div>
          <div>
            <div className="font-bold text-base tracking-wide" style={{ fontFamily: 'Syne, sans-serif' }}>
              SERPENT<span className="neon-text">HOP</span>
            </div>
            <div className="text-xs font-mono-app" style={{ color: 'var(--text-dim)' }}>King Legacy Auto Scout</div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
          background: running ? 'var(--neon-dim)' : 'var(--panel-3)',
          border: `1px solid ${running ? 'var(--neon)' : 'var(--border-c)'}`,
        }}>
          <div className={`w-2 h-2 rounded-full ${running ? 'dot-blink' : ''}`}
            style={{ background: running ? 'var(--neon)' : 'var(--text-dim)' }} />
          <span className="font-mono-app text-xs font-bold" style={{ color: running ? 'var(--neon)' : 'var(--text-dim)' }}>
            {running ? 'SCANNING' : 'IDLE'}
          </span>
        </div>

        <nav className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--panel-3)' }}>
          {(['dashboard', 'settings'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all"
              style={{
                background: tab === t ? 'var(--neon)' : 'transparent',
                color: tab === t ? '#000' : 'var(--text-dim)',
                fontFamily: 'Space Mono, monospace',
              }}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <main className="p-6 space-y-5 max-w-6xl mx-auto">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 slide-up">
            {[
              { label: 'Session Time', value: formatTime(elapsed), icon: 'Clock', color: 'var(--neon)' },
              { label: 'Hops Made', value: String(hopCount), icon: 'RefreshCw', color: '#60a5fa' },
              { label: 'Serpents Found', value: String(totalSerpents), icon: 'Zap', color: 'var(--danger)' },
              { label: 'Next Hop In', value: formatTime(nextHopIn), icon: 'Timer', color: 'var(--warn)' },
            ].map((stat, i) => (
              <div key={i} className="glass-panel p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest font-mono-app" style={{ color: 'var(--text-dim)' }}>
                    {stat.label}
                  </span>
                  <Icon name={stat.icon} size={14} style={{ color: stat.color }} />
                </div>
                <div className="text-3xl font-bold font-mono-app" style={{ color: stat.color, textShadow: `0 0 16px ${stat.color}55` }}>
                  {stat.value}
                </div>
                {i === 3 && running && (
                  <div className="mt-2 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border-c)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progressToNext}%`, background: 'var(--warn)', boxShadow: '0 0 8px var(--warn)' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1 glass-panel p-5 flex flex-col gap-4">
              <div className="text-xs font-bold uppercase tracking-widest font-mono-app" style={{ color: 'var(--text-dim)' }}>
                Control Panel
              </div>

              <div className="rounded-lg p-3" style={{ background: 'var(--panel-3)', border: '1px solid var(--border-c)', position: 'relative' }}>
                <div className="text-xs font-mono-app mb-1" style={{ color: 'var(--text-dim)' }}>Current Server</div>
                <div className="neon-text font-bold font-mono-app text-lg">{currentServer}</div>
                {running && (
                  <div className="dot-blink w-2 h-2 rounded-full absolute top-3 right-3" style={{ background: 'var(--neon)' }} />
                )}
              </div>

              <button
                onClick={handleStart}
                className="w-full py-4 rounded-xl font-bold text-lg tracking-wider transition-all hover:scale-105 active:scale-95"
                style={{
                  background: running ? 'rgba(255,59,92,0.1)' : 'rgba(0,255,136,0.1)',
                  border: `2px solid ${running ? 'var(--danger)' : 'var(--neon)'}`,
                  color: running ? 'var(--danger)' : 'var(--neon)',
                  boxShadow: running ? '0 0 20px rgba(255,59,92,0.25)' : '0 0 20px rgba(0,255,136,0.25)',
                  fontFamily: 'Syne',
                }}
              >
                {running ? '⏹ STOP SCAN' : '▶ START SCAN'}
              </button>

              <button
                onClick={handleReset}
                className="w-full py-2.5 rounded-lg text-sm font-bold tracking-wider transition-all hover:opacity-80"
                style={{
                  background: 'var(--panel-3)',
                  border: '1px solid var(--border-c)',
                  color: 'var(--text-dim)',
                  fontFamily: 'Space Mono',
                }}
              >
                ↺ RESET SESSION
              </button>

              <div>
                <div className="text-xs font-mono-app mb-2 font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
                  Hop Pattern
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pattern.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs font-mono-app"
                      style={{
                        background: i < hopCount ? 'var(--neon-dim)' : 'var(--panel-3)',
                        border: `1px solid ${i < hopCount ? 'var(--neon)' : 'var(--border-c)'}`,
                        color: i < hopCount ? 'var(--neon)' : 'var(--text-dim)',
                      }}
                    >
                      {formatTime(t)}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 text-xs font-mono-app" style={{ color: 'var(--text-dim)' }}>…</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 glass-panel p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-widest font-mono-app" style={{ color: 'var(--text-dim)' }}>
                  Live Activity Log
                </div>
                <div className="flex items-center gap-2">
                  {running && <div className="w-2 h-2 rounded-full dot-blink" style={{ background: 'var(--neon)' }} />}
                  <span className="font-mono-app text-xs" style={{ color: 'var(--text-dim)' }}>{logs.length} entries</span>
                </div>
              </div>
              <div
                ref={logRef}
                className="flex-1 overflow-y-auto space-y-1 font-mono-app text-xs"
                style={{ maxHeight: 300, minHeight: 240 }}
              >
                {logs.length === 0 && (
                  <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-dim)', minHeight: 200 }}>
                    Start scan to see live activity…
                  </div>
                )}
                {logs.map(log => (
                  <div key={log.id} className="flex gap-3 items-start py-1 border-b" style={{ borderColor: 'var(--border-c)' }}>
                    <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{log.time}</span>
                    <span style={{
                      color: log.type === 'danger' ? 'var(--danger)'
                        : log.type === 'success' ? 'var(--neon)'
                        : log.type === 'warn' ? 'var(--warn)'
                        : '#9ca3af',
                    }}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel p-5">
            <div className="text-xs font-bold uppercase tracking-widest font-mono-app mb-4" style={{ color: 'var(--text-dim)' }}>
              Server Pool
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SERVERS.map((s, i) => {
                const isActive = s === currentServer && running;
                const isVisited = hopCount > 0 && i < (hopCount % SERVERS.length);
                return (
                  <div
                    key={s}
                    className="rounded-lg p-3 transition-all"
                    style={{
                      background: isActive ? 'var(--neon-dim)' : 'var(--panel-3)',
                      border: `1px solid ${isActive ? 'var(--neon)' : 'var(--border-c)'}`,
                      boxShadow: isActive ? '0 0 16px var(--neon-dim)' : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono-app text-xs font-bold" style={{ color: isActive ? 'var(--neon)' : '#9ca3af' }}>
                        {s}
                      </span>
                      {isActive && <div className="w-2 h-2 rounded-full dot-blink" style={{ background: 'var(--neon)' }} />}
                      {isVisited && !isActive && <Icon name="Check" size={12} style={{ color: 'var(--text-dim)' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* SETTINGS */}
      {tab === 'settings' && (
        <main className="p-6 max-w-2xl mx-auto space-y-5 slide-up">
          <div className="text-xs font-mono-app font-bold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
            Configuration
          </div>

          <div className="glass-panel p-5 space-y-5">
            <div className="text-sm font-bold" style={{ color: 'var(--neon)', fontFamily: 'Syne' }}>Scan Timing</div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-mono-app" style={{ color: '#9ca3af' }}>Base Interval</span>
                <span className="font-mono-app text-sm neon-text">{formatTime(settings.scanInterval)}</span>
              </div>
              <input
                type="range" min={30} max={300} step={1}
                value={settings.scanInterval}
                onChange={e => setSettings(s => ({ ...s, scanInterval: +e.target.value }))}
                className="w-full"
              />
              <div className="flex justify-between mt-1 font-mono-app text-xs" style={{ color: 'var(--text-dim)' }}>
                <span>0:30</span><span>5:00</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-mono-app" style={{ color: '#9ca3af' }}>Max Hops Per Session</span>
                <span className="font-mono-app text-sm" style={{ color: 'var(--warn)' }}>{settings.maxHops}</span>
              </div>
              <input
                type="range" min={5} max={200} step={5}
                value={settings.maxHops}
                onChange={e => setSettings(s => ({ ...s, maxHops: +e.target.value }))}
                className="w-full"
              />
              <div className="flex justify-between mt-1 font-mono-app text-xs" style={{ color: 'var(--text-dim)' }}>
                <span>5</span><span>200</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-mono-app" style={{ color: '#9ca3af' }}>Detection Sensitivity</span>
                <span className="font-mono-app text-sm" style={{ color: '#60a5fa' }}>{settings.serpentChance}%</span>
              </div>
              <input
                type="range" min={1} max={20} step={1}
                value={settings.serpentChance}
                onChange={e => setSettings(s => ({ ...s, serpentChance: +e.target.value }))}
                className="w-full"
              />
              <div className="flex justify-between mt-1 font-mono-app text-xs" style={{ color: 'var(--text-dim)' }}>
                <span>1%</span><span>20%</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 space-y-4">
            <div className="text-sm font-bold" style={{ color: 'var(--neon)', fontFamily: 'Syne' }}>Alerts & Notifications</div>
            {[
              { key: 'soundAlert', label: 'Sound Alert on Detection', desc: 'Play audio when serpent found' },
              { key: 'discordNotify', label: 'Discord Webhook Notify', desc: 'Send message to Discord channel' },
              { key: 'autoStop', label: 'Auto-Stop on Detection', desc: 'Pause hopping when serpent found' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium" style={{ color: '#e8eaf0' }}>{label}</div>
                  <div className="text-xs font-mono-app" style={{ color: 'var(--text-dim)' }}>{desc}</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings[key as keyof typeof settings] as boolean}
                    onChange={e => setSettings(s => ({ ...s, [key]: e.target.checked }))}
                  />
                  <span className="toggle-track" />
                </label>
              </div>
            ))}
            {settings.discordNotify && (
              <div className="slide-up">
                <div className="text-xs font-mono-app mb-1.5" style={{ color: 'var(--text-dim)' }}>Discord Webhook URL</div>
                <input
                  type="text"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={settings.discordWebhook}
                  onChange={e => setSettings(s => ({ ...s, discordWebhook: e.target.value }))}
                  className="w-full rounded-lg px-3 py-2.5 text-sm font-mono-app outline-none"
                  style={{ background: 'var(--panel-3)', border: '1px solid var(--border-c)', color: '#e8eaf0' }}
                />
              </div>
            )}
          </div>

          <div className="glass-panel p-5 space-y-4">
            <div className="text-sm font-bold" style={{ color: 'var(--neon)', fontFamily: 'Syne' }}>Player Profile</div>
            <div>
              <div className="text-xs font-mono-app mb-1.5" style={{ color: 'var(--text-dim)' }}>Roblox Username</div>
              <input
                type="text"
                value={settings.playerName}
                onChange={e => setSettings(s => ({ ...s, playerName: e.target.value }))}
                className="w-full rounded-lg px-3 py-2.5 text-sm font-mono-app outline-none"
                style={{ background: 'var(--panel-3)', border: '1px solid var(--border-c)', color: 'var(--neon)' }}
              />
            </div>
          </div>

          <button
            className="w-full py-3.5 rounded-xl font-bold text-base tracking-wider transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(0,255,136,0.1)',
              border: '2px solid var(--neon)',
              color: 'var(--neon)',
              boxShadow: '0 0 20px rgba(0,255,136,0.2)',
              fontFamily: 'Syne',
            }}
          >
            SAVE SETTINGS
          </button>
        </main>
      )}
    </div>
  );
}