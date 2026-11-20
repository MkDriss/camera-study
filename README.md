# Camera Study: prototype de pilote (KV5045)

Une seule application Angular. Le lien envoyé à chaque participant décide de ce qu'il voit :

```
https://<ton-site>/?v=q3&code=K7Q2MD
```

- `v` est une clé définie dans `links` (fichier `study.config.ts`). Elle renvoie vers un profil visuel (`a` ou `b`) et une condition (`install` ou `jit`). La condition n'apparaît donc jamais dans la barre d'adresse. **Remplace les clés d'exemple par les tiennes** avant d'envoyer des liens.
- `code` est le code participant que **tu** génères. Il est obligatoire : un lien sans code, ou avec une clé inconnue, affiche « This study link is incomplete ».

Qui reçoit quelle clé, et dans quel ordre, c'est ta table d'attribution (sur OneDrive, séparée des réponses).

## Parcours du participant

1. Instructions
2. Création de compte (identité fictive, rien à saisir)
3. Conditions d'utilisation, puis la demande caméra pour la condition `install`
4. Espace de travail : panneau de tâches à gauche, faux service à droite, un onglet par tâche
   - signaler des problèmes dans une liste,
   - réserver un créneau dans un calendrier,
   - signer un document en maintenant un bouton.

   En condition `jit`, la notification de l'assistant, puis la demande caméra, apparaissent après la tâche n° `jitAfterTask`.
5. Écran final avec le code et le lien vers le MS Form

Indices visuels : la tâche en cours est mise en avant dans le panneau, avec un bouton « Go to … ». L'onglet correspondant porte son numéro, la zone sur laquelle agir est entourée, et un bandeau redirige le participant s'il est dans le mauvais onglet. Les tâches suivantes restent verrouillées jusqu'à ce que la précédente soit faite.

## Statut vis-à-vis du brief

Le brief autorise Claude pour « create pilot materials » et l'interdit pour « create final materials » et « create your study design ». Ce projet est donc un **prototype de pilote**. La version utilisée pour la vraie collecte doit être la tienne, et tous les textes qui comptent pour l'étude (instructions, conditions, demande de permission, notification) sont à rédiger toi-même dans `study.config.ts`.

## Lancer en local

Il faut Node.js 22 (LTS) ou plus récent.

```bash
npm install
npm start
```

Puis ouvre http://localhost:4200/?v=q3&code=TEST01

## Ce que tu modifies

Uniquement `src/app/study.config.ts`. Tout y est commenté : clés de liens, textes, profils, tâches (contenu, ordre, nombre), durée du maintien et moment de la notification (`jitAfterTask`).

Chaque profil (`a`, `b`) porte sa propre version du contenu à mesurer :
- `permissionBody` : le texte de la demande caméra. Les deux versions doivent avoir la même structure, seuls les détails changent.
- `formUrl` : le MS Form du questionnaire correspondant, avec `{code}` remplacé par le code participant.

Les clés de liens permettent de croiser librement version et condition (A + install, A + jit, B + install, B + jit), pour qu'une différence de difficulté entre les deux textes ne se confonde pas avec la condition.

Tant qu'un texte commence par `TODO`, un bandeau jaune le signale sur le premier écran.

## Ce que l'application ne fait pas, volontairement

- Elle ne demande **jamais** de vrai accès à la caméra (`getUserMedia` n'est appelé nulle part).
- Elle n'enregistre **aucune donnée** et n'envoie rien nulle part. Le brief impose les outils Microsoft pour la collecte : tout ce que tu mesures passe par MS Forms.
- Elle ne charge aucune ressource externe (polices système, pas de Google Fonts).

## Mettre en ligne pour le pilote

```bash
npm run build
```

Le site statique se trouve dans `dist/camera-study/browser/`. Si tu l'héberges dans un sous-dossier (GitHub Pages, par exemple), ajoute `--base-href /nom-du-depot/` à la commande de build.

Avant de l'héberger hors de l'université, vérifie que c'est compatible avec ton dossier d'éthique et avec les règles de gestion des données du module.

## Structure

```
src/app/
  study.config.ts      ← toute la conception de l'étude
  app.ts / app.html    ← enchaînement des écrans (machine à états)
  workspace.ts / .html ← panneau de tâches + faux service (onglets, liste, calendrier, document)
  hold-button.ts       ← bouton à maintenir (souris, tactile, clavier)
  permission-dialog.ts ← fausse demande de permission (<dialog> natif)
src/styles.css         ← tout le style
```
