const { Menu, BrowserWindow } = require("electron");
const path = require("path");

let tasksWindow = null;

async function openTasksWindow() {
  if (tasksWindow && !tasksWindow.isDestroyed()) {
    if (tasksWindow.isMinimized()) {
      tasksWindow.restore();
    }
    tasksWindow.focus();
    return;
  }

  tasksWindow = new BrowserWindow({
    width: 420,
    height: 570,
    resizable: false,
    autoHideMenuBar: true,
    fullscreen: false,
    icon: path.join(__dirname, "assets/image/teqheal.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(null);
  // tasksWindow.webContents.openDevTools();

  tasksWindow.loadFile("./pages/tasks.html");

  tasksWindow.on("closed", () => {
    tasksWindow = null;
  });
}

module.exports = { openTasksWindow };
