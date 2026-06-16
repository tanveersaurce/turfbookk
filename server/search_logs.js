import fs from 'fs';
import readline from 'readline';

const logPath = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\3d3877f0-60af-46e2-a95b-c7c946554537\\.system_generated\\logs\\transcript.jsonl';

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  try {
    const obj = JSON.parse(line);
    if (obj.step_index >= 2900 && obj.step_index <= 2942) {
      console.log('--- Step:', obj.step_index, 'Type:', obj.type, 'Source:', obj.source);
      if (obj.content) console.log('Content:', obj.content.substring(0, 1000));
      if (obj.tool_calls) console.log('Tool Calls:', JSON.stringify(obj.tool_calls).substring(0, 1000));
    }
  } catch (e) {
    // ignore
  }
});
