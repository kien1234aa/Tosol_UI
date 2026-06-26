const { execSync } = require('child_process');
const path = require('path');

const androidDir = path.join(__dirname, '..', 'android');
const isWindows = process.platform === 'win32';
const gradlew = isWindows ? 'gradlew.bat' : './gradlew';

execSync(`${gradlew} generateCodegenArtifactsFromSchema`, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: true,
});
