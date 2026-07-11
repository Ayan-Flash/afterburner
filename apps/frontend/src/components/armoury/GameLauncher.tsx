import React from 'react';
import { PanelFrame } from './PanelFrame';

/* ================================================================
   GameLauncher — "Game Launcher" panel with game icon grid.
   Shows mock game entries matching the reference image.
   ================================================================ */

interface Game {
  name: string;
  icon: React.ReactNode;
  color: string;
}

const games: Game[] = [
  {
    name: 'Aim Lab',
    color: '#ff6633',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6633" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    name: 'Xuan-Yuan Sword VII',
    color: '#ddaa33',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ddaa33" strokeWidth="2">
        <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
        <path d="M13 19l6-6" />
        <path d="M16 16l4 4" />
        <path d="M19 21l2-2" />
      </svg>
    ),
  },
  {
    name: 'Door Kickers 2',
    color: '#ffffff',
    icon: (
      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize="16" fontWeight="900" fontFamily="serif">
        DK2
      </text>
    ),
  },
  {
    name: '9 Monkeys of Shaolin',
    color: '#cc4422',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cc4422" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

export function GameLauncher() {
  return (
    <PanelFrame title="Game Launcher" className="ac-panel--flex1">
      <div className="ac-games">
        {games.map((game) => (
          <div key={game.name} className="ac-game">
            <div className="ac-game__icon">
              {typeof game.icon === 'string' ? (
                <span style={{ fontSize: 20 }}>{game.icon}</span>
              ) : (
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <rect width="48" height="48" fill={`${game.color}15`} />
                  <g transform="translate(10, 10)">
                    {game.icon}
                  </g>
                </svg>
              )}
            </div>
            <span className="ac-game__name">{game.name}</span>
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}
