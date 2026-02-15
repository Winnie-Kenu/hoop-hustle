export interface LevelConfig {
  level: number;
  hoopX: number;
  hoopY: number;
  hoopSpeed: number;
  gravity: number;
  rimSize: number;
  windForce: number;
  attempts: number;
}

export const levels: LevelConfig[] = [
  { level: 1, hoopX: 480, hoopY: 260, hoopSpeed: 0, gravity: 300, rimSize: 1.0, windForce: 0, attempts: 5 },
  { level: 2, hoopX: 520, hoopY: 240, hoopSpeed: 0, gravity: 320, rimSize: 0.95, windForce: 0, attempts: 5 },
  { level: 3, hoopX: 550, hoopY: 220, hoopSpeed: 0, gravity: 340, rimSize: 0.9, windForce: 0, attempts: 4 },
  { level: 4, hoopX: 530, hoopY: 230, hoopSpeed: 30, gravity: 340, rimSize: 0.9, windForce: 0, attempts: 4 },
  { level: 5, hoopX: 560, hoopY: 210, hoopSpeed: 50, gravity: 360, rimSize: 0.85, windForce: 0, attempts: 4 },
  { level: 6, hoopX: 550, hoopY: 220, hoopSpeed: 40, gravity: 360, rimSize: 0.85, windForce: 10, attempts: 3 },
  { level: 7, hoopX: 590, hoopY: 200, hoopSpeed: 60, gravity: 380, rimSize: 0.8, windForce: 20, attempts: 3 },
  { level: 8, hoopX: 610, hoopY: 190, hoopSpeed: 70, gravity: 400, rimSize: 0.75, windForce: 15, attempts: 3 },
  { level: 9, hoopX: 630, hoopY: 180, hoopSpeed: 90, gravity: 430, rimSize: 0.7, windForce: 30, attempts: 2 },
  { level: 10, hoopX: 650, hoopY: 170, hoopSpeed: 110, gravity: 470, rimSize: 0.65, windForce: 40, attempts: 2 },
];
