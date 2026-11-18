# STATUS gameday-chronometre
Phase: build
Etat: jeu implemente (branche feat/chronometre-game), playtest Reddit a faire
Round: R1
Maj: 2026-11-18
Hackathon: reddit-gameday-2026 / Best Daily Game
Deadline: 2026-12-09 03:00

Slot projet 20/30 (decision H du 2026-11-16) : idee a produire (lot d'ideation a definir), soumission unique par projet.

Idees validees par H le 2026-11-17 (30/30) : passage en phase build.

## opencode

(dossier cree automatiquement, aucune tache encore lancee)

## Claude

- 2026-11-18 : design (prompt design) fait sur la branche `design/chronometre-v1` : V1 rejetee (slop), V2 refs games, direction **Riso** validee, matiere V2.3 validee, 4 planches validees, **/lock** acte. Livrables `G-DESIGN/` (PAGES, REFS, STYLE, DESIGN, planches/v2). Suite : 07b implementation (app Devvit absente du repo a ce jour).
- 2026-11-18 : 07b fait sur `feat/chronometre-game` : app Devvit Web (splash + game), API init/submit/standings/comment, Redis (classement, histogramme, series), cron quotidien 00:00 UTC, couche Riso portee depuis les planches, README EN. Tests unitaires 9/9, types, lint, build OK. Revue planche/produit dans `G-DESIGN/revue/`. Reste (humain) : `devvit login`, playtest sur le sub de test, verifier filtres SVG dans l'iframe Reddit, commentaire en tant qu'utilisateur, cron.
