# Study Quest

A small interactive learning game built with React. Players type answers to generated math problems, decide yes or no after reading short stories, and place words into sentences. A ten-step map tracks progress. Their customizable companion earns XP and subject skills across sessions, levels up, and gains a crown at level 3. Correct answers earn points and streak bonuses; players have three hearts and two hints. Separate player profiles let people on the same browser keep their own progress.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The output in `dist/` can be deployed to any static host such as Netlify or Vercel.

## How to play

Choose Math Lab, Story Corner, Word Workshop, or a mixed quest. Challenges alternate between multiple choice and hands-on play. On hands-on turns, type math answers, place a word in a sentence, or choose Yes or No and check a reading answer. Build a streak for bonus points, use up to two hints, and review your result at the end. The game ends early after three incorrect answers. Each player's companion XP, level, skills, name, and color are saved in that browser. Existing single-player progress is imported automatically. Profiles do not sync across devices.

## Avatar progression and level rewards

Create a player profile, then customize your avatar's name, color, and form (forest sprite, star orb, or study bot). Progress saves automatically in the current browser. Correct answers earn 10 XP; practice attempts earn 2 XP. Every 50 XP grants a level. At level 3 (100 XP), the avatar receives a star crown, two additional hints per quest, and a shield that absorbs one wrong answer without losing a heart. Unlocking level 3 during a quest grants the rewards immediately. Each new quest refreshes the hints and shield.

Progress is browser-local, not a cloud account, and does not sync between devices. Clearing browser storage removes saved profiles.
