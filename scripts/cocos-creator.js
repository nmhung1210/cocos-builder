#!/usr/bin/env node

const execSync = require("child_process").execSync;
const argv = require("yargs").argv;
const resolve = require("path").resolve;

const build = argv.build || "platform=web-mobile;debug=false";
const projectDir = argv.path || process.cwd();

const run = cmd => execSync(cmd, { stdio: "inherit" });
process.chdir(resolve(__dirname, "..", "creator"));

if (require("fs").existsSync("/usr/local/bin/startx")) {
  run("startx");
}
run(`npx electron . --path="${projectDir}" --build="${build}" `);
