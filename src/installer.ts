import path from "node:path";
import { execSync } from "child_process";
import chokidar from "chokidar";
import { EXCHANGE_PATH } from "./config.js";
import { ensureExchangeDirectoryExists, getMostRecentFile } from "./utils.js";

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

  public installMostRecentPackages(packages: string[]) {
    packages.forEach((p) => {
      const newestPackageFile = this.getMostRecentPackageFile(p);
      if (newestPackageFile) {
        console.log(`Installing '${p}'...`);
        this.installPackageFile(newestPackageFile);
      }
    });
  }
  
  private installPackageFile(filePath: string) {
    const packagePath = path.dirname(filePath);
    const newestPackageFile = getMostRecentFile(packagePath);

    if (newestPackageFile) {
      execSync(`npm i ${path.join(packagePath, newestPackageFile.file)}`, {
        cwd: process.cwd(),
        stdio: "inherit",
      });
    } else {
      console.error(`No package file found in ${packagePath}`);
      process.exit(1);
    }
  }

  public getMostRecentPackageFile(packageName: string): string | undefined {
    const newestPackageFile = getMostRecentFile(
      path.join(this.exchangePath, packageName),
    )?.file;

    return newestPackageFile
      ? path.join(this.exchangePath, packageName, newestPackageFile)
      : undefined;
  }

  public watch(packages: string[]) {
    this.installMostRecentPackages(packages);

    console.info("Start watching for changes of packages:");
    packages.forEach((p) => {
      console.info(`- ${p}`);
    });

    this.watcher = chokidar.watch(
      packages.map((p) => path.join(this.exchangePath, p)),
      { ignoreInitial: true },
    );

    this.watcher.on("add", (filePath) => {
      console.info("Package update detected. Installing now...");
      this.installPackageFile(filePath);
      console.info("Package installed successfully!");
    });

    this.watcher.on("change", (filePath) => {
      console.info("Package update detected. Installing now...");
      this.installPackageFile(filePath);
      console.info("Package installed successfully!");
    });

    if (this.debug) {
      this.watcher.on("all", (event, path) => {
        console.log("[DEBUG]", event, path);
      });
    }
  }
}
