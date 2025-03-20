const { BrowserWindow, screen } = require("electron");
const path = require("path");

let screenshotWindow = null;

function openScreenshotWindow() {
  screenshotWindow = new BrowserWindow({
    width: 250,
    height: 150,
    frame: true,
    movable: false,
    show: true,
    resizable: false,
    closable: true,
    titleBarStyle: "hidden",
    transparent: true,
    alwaysOnTop: true,
    fullscreen: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });

  const { width } = screen.getPrimaryDisplay().workAreaSize;
  screenshotWindow.setBounds({ x: width - 290, y: 50 });

  screenshotWindow.loadFile("screenshot/screenshot.html");

  setTimeout(() => {
    if (screenshotWindow) {
      screenshotWindow.close();
      screenshotWindow = null;
    }
  }, 6000);
}

module.exports = { openScreenshotWindow };
