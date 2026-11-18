# Knucklebones Online

A two-player, browser-based dice game inspired by Knucklebones. Create a room, share its link or six-character code, and take turns placing dice. Works on mobile and desktop. Choose a dice skin from the menu in the header; your choice is saved in your browser and applies to both boards and the current roll.

## Run

Requires Node.js 18 or newer; no dependencies are required.

```sh
npm start
```

Open http://localhost:3000. For play on separate devices, host the server at an address both devices can reach. Set `PORT` to change the listening port. Run `npm test` for the scoring checks.

Rooms and player credentials live in server memory and disappear when it restarts. Rooms are intended for casual private play; there is no account system or persistent storage. A player can reconnect in the same browser tab after a temporary disconnect. Leaving a room does not free its seat; create a new room for another game.

## Deploy on Render

The included `render.yaml` configures a free Render web service that runs the app and multiplayer server together. Push this repository to GitHub, then:

1. Sign in to [Render](https://dashboard.render.com/) and connect your GitHub account.
2. Select **New → Blueprint**, choose the repository, and apply the blueprint. Render builds and deploys the service using `render.yaml`.
3. Open the `onrender.com` URL shown in the Render dashboard and share it with your opponent.

The free service may spin down after inactivity and take time to start on the next request. Rooms and games are kept in memory, so a spin-down, restart, or redeploy removes them. Run only one service instance: rooms are not shared between instances. Check Render's current free-tier limits and eligibility before deploying.
