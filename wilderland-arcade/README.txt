WILDERLAND ARCADE
=================

Main page: "Wilderland Arcade.dc.html"

How to run it on your computer
- The page loads its game scripts from the same folder, so run it from a small local web server
  instead of double-clicking the file:
    1. Open a terminal in this folder.
    2. Run:  python3 -m http.server 8000
    3. Visit:  http://localhost:8000/Wilderland%20Arcade.dc.html

What's inside
- Wilderland Arcade.dc.html  - the arcade floor, accounts, achievements, learn mode, leaderboard
- support.js                 - the page runtime it was built on (Claude Design format)
- arcade-core.js             - shared helpers, sounds, learn-mode question generator
- games-*.js                 - the 18 games
- fonts/, assets/            - Uncut Sans font files and the logo
- compat.json                - page list used by the Claude canvas

Saved data (tickets, accounts, saves, leaderboard, parent code) lives in the browser's local storage,
so it is separate for each browser and each address you open it from.
