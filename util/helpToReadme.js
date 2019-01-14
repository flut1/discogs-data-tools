const { fork } = require("child_process");
const fs = require("fs-extra");

const help = fork("./cli", ["help"], { silent: true });
let output = "";

help.stdout.on("data", data => {
  output += data;
});

help.on("close", () => {
  const readmeContents = fs.readFileSync("./readme.md", { encoding: "utf8" });
  const newContents = readmeContents.replace(
    /```\s+discogs-data-tools[\s\S]+?```/,
    `\`\`\`\n${output.trim().replace(/cli/g, "discogs-data-tools")}\n\`\`\``
  );

  fs.writeFileSync("./readme.md", newContents, { encoding: "utf8" });
});
