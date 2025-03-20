const {
  app,
  BrowserWindow,
  Menu,
  session,
  desktopCapturer,
  ipcMain,
} = require("electron");
const path = require("path");
const storage = require("node-persist");
const { captureAndUpload } = require("./screenshotUploadService");
const { openTasksWindow, tasksWindow } = require("./tasksWindow");

let userData;
let loginWindow;
let isShowTest = false;

async function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 370,
    height: 520,
    resizable: false,
    autoHideMenuBar: true,
    fullscreen: isShowTest,
    icon: path.join(__dirname, "assets/image/teqheal.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (!isShowTest) {
    Menu.setApplicationMenu(null);
  } else {
    loginWindow.webContents.openDevTools();
  }
}

(async () => {
  await storage.init();
  userData = await storage.getItem("userData");
  if (userData !== undefined) {
    loginWindow.loadFile("./pages/tracking.html");
  } else {
    loginWindow.loadFile("./pages/login.html");
  }
})();

app.on("ready", () => {
  createLoginWindow();

  captureAndUpload(userData);

  app.on("window-all-closed", (e) => {
    if (process.platform !== "darwin") {
      e.preventDefault();
      app.quit();
    }
  });

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      const screenSource = sources[0];
      callback({ video: screenSource, audio: "loopbackWithMute" });
    });
  });
});

ipcMain.on("openTasksWindow", (event, data) => {
  openTasksWindow();
});

app.on("before-quit", () => {
  app.quit();
});
