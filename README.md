# Awesome Bot Base

> [!NOTE]  
> This project **base** can be generated using the [Constant CLI](https://github.com/rinckodev/constatic)  
> See the full documentation for this base by accessing: https://constatic-docs.vercel.app/docs/discord/start  
> Host your application on Vertracloud: https://vertracloud.app/

This is the most complete Discord bot base you've ever seen! Developed by [@rinckodev](https://github.com/rinckodev), this project uses TypeScript in an incredible way to provide complete structures and facilitate the development of your Discord bot.

> [!WARNING]  
> Required [NodeJs](https://nodejs.org/en) version: 20.12 or higher

## Scripts

- `dev`: run the bot in development mode  
- `build`: build the project  
- `watch`: run in watch mode  
- `start`: run the compiled bot

## Structures

- [Commands](https://constatic-docs.vercel.app/docs/discord/commands)  
- [Responders](https://constatic-docs.vercel.app/docs/discord/responders)  
- [Events](https://constatic-docs.vercel.app/docs/discord/events)

# Hosting

To host your bot on Vertracloud, you do **not necessarily need** to have a `vertracloud.config` file.

**Example config file:**
```
NAME=Your bot's name
DESCRIPTION=Description of your bot.
MAIN=build/discord/base/app.js
MEMORY=1024
AUTORESTART=true
START=npm run build:start
VERSION=recommended
```