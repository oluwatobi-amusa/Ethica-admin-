# Starter Pack

## Ethica bank operations portal

The dashboard is a frontend-only mobile banking operations demo built into the existing Next.js app. Open `/dashboard` for the operational overview, then use the sidebar to browse customers, transactions, service activity and admin settings. Customer profiles are available from the customer list.

The portal uses fictional sample customers and transactions from `components/MicrofinancePortal/data.ts`. Customer support actions, audit entries and statement exports are demos only and do not connect to a bank service. Do not enter real customer data or credentials. Demo audit entries are stored in the current browser session.

The existing Till Management route is retained alongside the portal navigation.

## Tech Stack 🥞

- [NextJS](https://nextjs.org/)
- [TailwindCss](https://tailwindcss.com/)

## Code Rules and Structure 📖

You can look through the codebase to see how code is structured and written. ESlint also enforces some rules.

## Pre-commits 🏁

On every commit the following scripts are run

- yarn check-format (Check Prettier standards)
- yarn check-lint (Check ESLint standards)
- yarn check-types (Check tsconfig standards)

## Setting up Project 👨🏾‍💻

```
git clone https://github.com/hackib-dev/starter-pack.git
# or with the Github CLI
gh repo clone hackib-dev/starter-pack

cd starter-pack
yarn
yarn dev

# yarn dev (run application in development mode)
# yarn build (build apps)
# yarn lint (Eslint Check)
# yarn format (Format code with prettier)
```

## Environmental Variables 🌳

Look at the `template.env` file to see the environmental variables, copy it to a `.env` file and set your values.

## Frontend Figma Designs

[Figma Design](https://www.figma.com/...)
