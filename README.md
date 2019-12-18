# Wine & Cheese Map

This is an app to view wine and cheese pairings through a [Cytoscape.js](https://js.cytoscape.org) visualisation.

This app is a demo of the sort of functionality that Cytoscape.js allows you to easily add to your webapp.  This repository is MIT-licensed, like Cytoscape.js itself.

The data was generated from recommendations in Max McCalman's book, [Cheese: A Connoisseur's Guide to the World's Best](https://www.amazon.ca/Cheese-Connoisseurs-Guide-Worlds-Best/dp/1400050340/ref=sr_1_3?s=books&ie=UTF8&qid=1416109370&sr=1-3).

## Project organisation

This app can be used as an example of how you might structure your modern webapp.  While this repository may act as a good general reference, you would probably want to tailor and optimise the build configuration files for your project.

The technologies used for this project include:

- Building
  - Webpack: Bundle JS
  - PostCSS: Bundle CSS
  - Babel: Compile newer JS to older JS to support older browsers
  - CSSNext: Compile newer CSS to older CSS to support older browsers
- UI
  - Preact: Basic component support
  - Cytoscape: Graph/network visualisation
- Linting
  - ESLint: Identify common problems in JS
  - Stylelint: Identify common problems in CSS

## Building the project

The project's build targets are specified as npm scripts.  Use `npm run <target>` for one of the following targets:

- `watch` : Do a debug build of the app, which automatically rebuilds and reloads as the code changes
- `prod` : Do a production build of the app
- `clean` : Delete all files under the dist directory
- `lint` : Run linters on the JS and CSS files

