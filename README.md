# Muzify

#### Overview

Muzify is a web app that allows you to view and edit your spotify playlists, and to export the playlist content to a CSV file.
It also generates recommendations for your playlist, which can be previewed using the apps' audio player.

The app is built using Tailwind CSS and Vanilla Javascript. It integrates the Spotify API to get information about the user and their playlists, while also allowing the user to modify their playlists.

The purpose of the project was to find creative ways to get new song recommendations for music playlists, learn about API calls, as well as improve my understanding of vanilla Javascript.

The app currently can only be properly used on a desktop computer, mobile responsiveness has yet to be added.

#### How to run

1. run live server from project folder.

In case of CSS not rendering properly:

1. run "npm install" in the terminal
2. run `npx tailwindcss -i ./src/main-styles.css -o ./dist/output.css --watch` to initiate TailwindCSS
3. run live server!
