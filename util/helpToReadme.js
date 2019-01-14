const { fork } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const help = fork(path.join(__dirname, '../cli'), ["help"], { silent: true });
let output = "";

help.stdout.on("data", data => {
  output += data;
});

help.on("close", () => {
  const readmePath = path.join(__dirname, '../readme.md');
  const readmeContents = fs.readFileSync(readmePath, { encoding: "utf8" });
  const newContents = readmeContents.replace(
    /```\s+discogs-data-tools[\s\S]+?```/,
    `\`\`\`\n${output.trim().replace(/cli/g, "discogs-data-tools")}\n\`\`\``
  );

  fs.writeFileSync(readmePath, newContents, { encoding: "utf8" });
});
