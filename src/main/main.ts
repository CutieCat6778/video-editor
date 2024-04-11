import mm from "music-metadata";
import { app, BrowserWindow, ipcMain } from "electron";
import { readFile, writeFile } from "fs";
import path from "node:path";
import si from "systeminformation";
import { Path } from "src/renderer/App";
import Ffmpeg from "fluent-ffmpeg";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

    // and load the index.html of the app.
    console.log(
        "MAIN_WINDOW_VITE_DEV_SERVER_URL",
        MAIN_WINDOW_VITE_DEV_SERVER_URL
    );
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(
                __dirname,
                `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
            )
        );
    }
    // if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    //   const url = new URL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}/${htmlFileName}`);
    //   url.pathname = htmlFileName;
    //   return url.href;
    // }
    // return `file://${path.join(
    //   __dirname,
    //   `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html?${htmlFileName}`
    // )}`;

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
const doStuff = async () => {
    const data = await si.osInfo();
    console.log("osInfo data: ", data);
};
doStuff();

ipcMain.handle("getOsData", async () => {
    return await si.osInfo();
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
ipcMain.on(
    "render-audio",
    async (_event, data: { output: string; paths: Path[] }) => {
        const ffmpeg = Ffmpeg();
        // Create new file with data.output path
        writeFile(data.output, '', (err) => {
            if (err) {
            console.error(err);
            } else {
            console.log('New file created successfully!');
            }
        });
        
        // merge all paths into one file using fluent-ffmpeg
        for(let path of data.paths){
            console.log(path)
            ffmpeg.input(path.path);
        };
        ffmpeg.output(data.output).on('process', progress => {
            console.log('Processing: ' + progress.percent + '% done');
        }).on('error', function(err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
          }).on('end', function(stdout, stderr) {
            console.log('Transcoding succeeded !');
          }).run();
    }
);
