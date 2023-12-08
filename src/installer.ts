import chokidar from "chokidar";
import { EXCHANGE_PATH } from "./config.js";
import path from "node:path";
import {ensureExchangeDirectoryExists, getMostRecentFile} from "./utils.js";
import { execSync } from "child_process";

export class Installer {
  private readonly exchangePath: string;
  private watcher: chokidar.FSWatcher | undefined;
  private debug: boolean = false;

  constructor(path = EXCHANGE_PATH) {
    this.exchangePath = path;
    ensureExchangeDirectoryExists(path);
  }

  public enableDebug() {
    this.debug = true;
  }

  private handlePackageChange(filePath: string) {
    const packagePath = path.dirname(filePath);
    const newestPackageFile = getMostRecentFile(packagePath);

    if (newestPackageFile) {
      console.info("Package update detected. Installing now...");
      execSync(`npm i ${path.join(packagePath, newestPackageFile.file)}`, {
        cwd: process.cwd(),
        stdio: "inherit",
      });
      console.info("Package installed successfully!");
    } else {
      console.error(`No package file found in ${packagePath}`);
      process.exit(1);
    }
  }

  public watch(packages: string[]) {
    
    packages.forEach((p) => {
      const newestPackageFile = getMostRecentFile(
        path.join(this.exchangePath, p),
      )?.file;
      console.log(p, newestPackageFile);
      if (newestPackageFile) {
        console.log(`Initially installing '${p}'...`);
        const filePath = path.join(this.exchangePath, p, newestPackageFile);
        this.handlePackageChange(filePath);
      }
    });

    console.info("Start watching for changes of packages:");
    packages.forEach((p) => {
      console.info(`- ${p}`);
    });

    this.watcher = chokidar.watch(
      packages.map((p) => path.join(this.exchangePath, p)),
      { ignoreInitial: true },
    );

    this.watcher.on("add", this.handlePackageChange);
    this.watcher.on("change", this.handlePackageChange);

    if (this.debug) {
      this.watcher.on("all", (event, path) => {
        console.log("[DEBUG]", event, path);
      });
    }
  }
}
