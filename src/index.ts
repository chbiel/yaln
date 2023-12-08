import fs from "node:fs";
import path from "node:path";
import { program } from "commander";
import { execSync } from "child_process";
import { EXCHANGE_PATH } from "./config.js";
import { Installer } from "./installer.js";
import {ensureExchangeDirectoryExists} from "./utils.js";

program.name("lnmp");

program
  .command("watch")
  .description("Watch a package for changes")
  .argument("<packages...>", "List of packages to watch")
  .option("--debug", "enable debug mode", false)
  .action((packages: string[], options) => {
    const w = new Installer();
    if (options.debug) {
      console.log("DEBUG mode enabled");
      w.enableDebug();
    }
    w.watch(packages);
  });

program
  .command("pack")
  .description(
    'Use "npm pack" to create package locally. Execute as build watcher command',
  )
  .argument(
    "[packageName]",
    "The current package name. Will try to get from package.json by default",
  )
  .action((packageName?: string) => {
    let actualPackageName = packageName;
    if (!actualPackageName) {
      actualPackageName = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "package.json")).toString(),
      ).name;
    }

    if (!actualPackageName || actualPackageName === "") {
      console.error("No package name provided or not found in package.json");
      process.exit(1);
    }

    
    const packageExtractPath = path.join(EXCHANGE_PATH, actualPackageName);
    ensureExchangeDirectoryExists(packageExtractPath);

    execSync(`npm pack --pack-destination ${packageExtractPath}`, {
      cwd: process.cwd(),
    });
  });

program
  .command("clear")
  .argument("[packageName]", "Name of the package to delete")
  .description("Delete all locally published packages")
  .action((packageName?) => {
    if (packageName) {
      const packageExtractPath = path.join(EXCHANGE_PATH, packageName);
      if (fs.existsSync(packageExtractPath)) {
        fs.rmSync(packageExtractPath, { recursive: true, force: true });
      }
    } else {
      const installedPackages = fs.readdirSync(EXCHANGE_PATH);
      installedPackages.forEach((ip) => {
        fs.rmSync(path.join(EXCHANGE_PATH, ip), {
          recursive: true,
          force: true,
        });
      });
    }
  });

program.parse(process.argv);
