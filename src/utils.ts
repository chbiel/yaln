import fs from "node:fs";
import path from "node:path";
import {EXCHANGE_PATH} from "./config.js";

export const ensureExchangeDirectoryExists = (exchangePath = EXCHANGE_PATH) => {
    if (!fs.existsSync(exchangePath)) {
        fs.mkdirSync(exchangePath, { recursive: true });
    }
}

export interface File {
    file: string;
    mtime: Date;
}

export const getMostRecentFile = (dir: string): File | undefined => {
    const files = orderRecentFiles(dir);
    return files.length ? files[0] : undefined;
};

const orderRecentFiles = (dir: string) => {
    return fs
        .readdirSync(dir)
        .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
        .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};