# USAID Private Sector Evidence Gap Map
The Evidence Gap Map is a visual representation of existing evidence, using a matrix of USAID’s conceptualization of PSE means and value propositions that both the private sector and development actors offer. We hope that by compiling this evidence in one place with a number of filter and search features, we will help facilitate the use of evidence.

# Technology Overview
This code repository drives the interactive EGM application that is deployed using GitHub Pages and available at the following URL: https://crcresearch.github.io/usaid-pse-egm. The design and function was formed as a collaborative effort between the Center for Research Computing (https://crc.nd.edu/) and the Pulte Institute of Global Development (https://pulte.nd.edu/) at the University of Notre Dame

The webpage functions as a Single Page App (SPA) using the CDN version of the VueJS client side framework. The document data is curated and managed within an Airtable base. Each time a Release is published on this codebase, a GitHub action is used to fetch the current data and transform the data into a flat `json` format for the web application. See the `data` folder for past revisions of data exports from Airtable.

# Development Setup
In order to serve the data file properly while keeping a simple development environment setup, we recommend using the `lite-server` npm package. To install and run a development version locally:
* clone git repository and `cd` into cloned directory
* install lite-server - `npm install`
* run dev server - `npm run dev` 
* The local version will be available in a browser at `http://localhost:3000`




