import { execSync } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const config = require("./config.json");

const { user, server, remote_path } = config.deploy ?? {};

if (!server) {
  console.error('Deploy abortado: preencha "deploy.server" no config.json.');
  process.exit(1);
}

const dest = `${user}@${server}:${remote_path}`;
console.log(`Enviando dist/ → ${dest}`);
execSync(`scp -r . ${dest}`, { cwd: "./dist", stdio: "inherit" });

console.log("Ajustando permissões no servidor...");
execSync(
  `ssh ${user}@${server} "chown -R www-data:www-data ${remote_path} && chmod -R 755 ${remote_path}"`,
  { stdio: "inherit" }
);
console.log("Deploy concluído.");
