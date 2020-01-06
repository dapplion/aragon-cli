# Buidler - Aragon POC

Based on [Typescript Solidity Dev Starter Kit](https://github.com/rhlsthrm/typescript-solidity-dev-starter-kit)

The tasks in this repo should eventually become a buidler plugin that will be used in the environment of Aragon Apps. This plugin will have only part of the features of the current aragon CLI, mainly:

- `publish`: Build, upload and publish a new App version
- `run`: Publish the current App for local development

The purpose of this repo is to be starting point to progressively build such functionality. Moving to buidler is a great opportunity to re-write these commands, given the difficulties found while attempting to refactor them in the context of the current CLI.

---

These concerns below should be addressed before progressing:

- How will this buidler plugin connect to ENS, APM and DAO templates locally? Is there going to be a snapshot like currently?
- How is @aragon/aragen going to integrate with this buidler plugin?
- How is logging, reporting going to work in buidler? Are we gonna continue using `listr` or move to something else?

## Using this Project

Clone this repository, then install the dependencies with

```
npm install
```

Then can check the available tasks with

```
npx buidler
```

You can run the mock task `aragon run` to see buidler in action. **Note** that the command now does non-sense actions like uploading the `build` folder. These are just placeholders / mocks for the actual functionality being implemented latter.

```
npx buidler start
```
