const { fork } = require('child_process');
const fs = require('fs-extra');

const help = fork('./index', ['help'], { silent: true });
let output = '';

help.stdout.on('data', (data) => {
  output += data;
});

help.on('close', () => {
  const readmeContents = fs.readFileSync('./readme.md', { encoding: 'utf8' });
  const newContents = readmeContents.replace(/```\s+index[\s\S]+?```/, `\`\`\`\n${output.trim()}\n\`\`\``);

  fs.writeFileSync('./readme.md', newContents, { encoding: 'utf8' });
});