-- Migration 004 : ajout du vainqueur aux tirs au but sur les matchs à élimination directe
-- À jouer une fois sur toute base existante (locale ou Render).

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS penalty_winner_id INT REFERENCES teams(id);
