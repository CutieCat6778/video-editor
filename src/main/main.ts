import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { readFile } from "fs";
import * as path from "path";
import { Path } from "../renderer/src/App";
const mm = require("music-metadata");
import Ffmpeg from "fluent-ffmpeg";

let mainWindow: BrowserWindow | null;

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({});
    if (!canceled) {
        return filePaths[0];
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, "../preload/preload.js"),
            webSecurity: false,
        },
    });

    // Vite dev server URL
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.on("closed", () => (mainWindow = null));
}

app.whenReady().then(() => {
    ipcMain.handle("dialog:openFile", handleFileOpen);
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (mainWindow == null) {
        createWindow();
    }
});

ipcMain.on("get-file-info", async (event, path) => {
  readFile(path, async (err, data) => {
      if (err) {
          console.error(err);
          event.sender.send("error", err);
          return;
      }
      try {
          const metadata = await mm.parseBuffer(data, "audio/mpeg");
          console.log(metadata);
      } catch (error: any) {
          event.sender.send("error", error);
      }
  });
});
ipcMain.on("render-audio", async (_event, data: { output: string, paths: Path[] }) => {
  const ffmpeg = Ffmpeg();
  // using ffmpeg library to render audio
  for(let path of data.paths) {
    ffmpeg.addInput(path.path);
  }
  ffmpeg.mergeToFile(data.output, "./tmp");
});