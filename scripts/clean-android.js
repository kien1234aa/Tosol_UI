const { execSync } = require('child_process');
const path = require('path');

const androidDir = path.join(__dirname, '..', 'android');
const appDir = path.join(androidDir, 'app');
const isWindows = process.platform === 'win32';
const gradlew = isWindows ? 'gradlew.bat' : './gradlew';

try {
  execSync(`${gradlew} --stop`, { cwd: androidDir, stdio: 'ignore', shell: true });
} catch {
  // Gradle daemon may not be running.
}

execSync(`${gradlew} clean`, { cwd: androidDir, stdio: 'inherit', shell: true });

// Regenerate New Architecture codegen removed by `clean` before the next CMake configure.
execSync(`${gradlew} generateCodegenArtifactsFromSchema`, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: true,
});
