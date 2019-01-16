const { fork } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const commands = ["fetch", "mongo"];

Promise.all(
  commands.map(command => {
    return new Promise(resolve => {
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
    });
  })
).then(output => {
  const readmePath = path.join(__dirname, "../readme.md");
  const readmeContents = fs.readFileSync(readmePath, { encoding: "utf8" });
  const newContents = readmeContents.replace(
    /<!-- CLI -->[\s\S]+<!-- \/CLI -->/,
    `<!-- CLI -->\n${output
      .map(
        (help, index) =>
          `\n#### discogs-data-tools ${
            commands[index]
          }\n\`\`\`\n${help
            .trim()
            .replace(/cli/g, "discogs-data-tools")}\n\`\`\``
      )
      .join("\n")}\n<!-- /CLI -->`
  );

  fs.writeFileSync(readmePath, newContents, { encoding: "utf8" });
});
