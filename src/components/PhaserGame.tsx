import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from '../game/GameScene';

const PhaserGame = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 500,
      parent: containerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [GameScene],
      backgroundColor: '#0d1220',
      pixelArt: false,
      antialias: true,
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl rounded-xl overflow-hidden border border-border shadow-2xl"
      style={{ aspectRatio: '8 / 5' }}
    />
  );
};

export default PhaserGame;
