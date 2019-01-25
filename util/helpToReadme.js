const { fork } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const readmePath = path.join(__dirname, "../readme.md");
const readmeContents = fs.readFileSync(readmePath, { encoding: "utf8" });
const commands = [];
const commandRegex = /<!-- CLI: ?([a-zA-Z]+) -->[\s\S]+?<!-- \/CLI -->/g;
let match;

// eslint-disable-next-line no-cond-assign
while (match = commandRegex.exec(readmeContents)) {
  commands.push(match[1]);
}

Promise.all(
  commands.map(
    command =>
      new Promise(resolve => {
        let subOutput = "";

        const help = fork(path.join(__dirname, "../cli"), [command, "help"], {
          silent: true
        });
        help.stdout.on("data", data => {
          subOutput += data;
        });

        help.on("close", () => {
          resolve(subOutput);
        });
      })
  )
).then((output) => {
  let newContents = readmeContents;
  output.forEach((commandOutput, index) => {
    newContents = newContents.replace(
      new RegExp(`<!-- CLI: ?(${commands[index]}) -->[\\s\\S]+?<!-- \\/CLI -->`, 'g'),
      `<!-- CLI: ${commands[index]} -->\n\`\`\`\n${commandOutput.trim().replace(/cli/g, "discogs-data-tools")}\n\`\`\`\n<!-- /CLI -->`
    );
  });

  fs.writeFileSync(readmePath, newContents, { encoding: "utf8" });
});
