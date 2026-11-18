# Knucklebones Online

A two-player, browser-based dice game inspired by Knucklebones. Create a room, share its link or six-character code, and take turns placing dice. Works on mobile and desktop.

## Run

Requires Node.js 18 or newer; no dependencies are required.

```sh
npm start
```

Open http://localhost:3000. For play on separate devices, host the server at an address both devices can reach. Set `PORT` to change the listening port. Run `npm test` for the scoring checks.

Rooms and player credentials live in server memory and disappear when it restarts. Rooms are intended for casual private play; there is no account system or persistent storage. A player can reconnect in the same browser tab after a temporary disconnect. Leaving a room does not free its seat; create a new room for another game.
