const { ipcMain } = require("electron");
const { GlobalKeyboardListener } = require("node-global-key-listener");
const screenshot = require("screenshot-desktop");
const { stopTimer, startTimer } = require("./eventScheduler");
const { openScreenshotWindow } = require("./screenshotWindow");
// const storage = require("node-persist");
require("./config.js");

let mouseEventCount = 0;
let keyboardKeyPressCount = 0;

// let userData;
let attendanceData;

// (async () => {
//   await storage.init();
//   userData = await storage.getItem("userData");
// })();

ipcMain.on("attendanceData", (event, data) => {
  attendanceData = data;
});

const keyboard = new GlobalKeyboardListener();

let isTakeScreenShot = true;
let showScreenShot = true;
let screenshotTime = 20;

ipcMain.on("call-api", async (event, { dataUrlMain }) => {
  const base64Data = dataUrlMain.split(",")[1];
  const mimeType = "image/png";
  const imageBlob = base64ToBlob(base64Data, mimeType);
  uploadImage(imageBlob);
});

async function captureAndUpload() {
  setInterval(async () => {
    if (
      attendanceData &&
      attendanceData.isPunchIn === true &&
      attendanceData.isBreakIn === false
    ) {
      startTimer(15, () => {
      // startTimer(1, () => {
        if (isTakeScreenShot) {
          if (showScreenShot) {
            openScreenshotWindow();
          } else {
            takeScreenShot();
          }
        }
      });
    } else {
      stopTimer();
    }
  }, 1000);
}

function base64ToBlob(base64Data, mimeType) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}

async function uploadImage(imageBlob) {
  try {
    const formData = new FormData();
    formData.append("userId", attendanceData.userId);
    formData.append("screenshot", imageBlob, "screenshot.png");
    formData.append("keyPressCount", keyboardKeyPressCount);
    formData.append("mouseEventCount", mouseEventCount);

    const response = await fetch(
      `${environment.apiBaseUrl}/api/addAttendance`,
      {
        method: "POST",
        body: formData,
      }
    );

    const responseData = await response.json();
    if (responseData.success === true) {
      keyboardKeyPressCount = 0;
      mouseEventCount = 0;
    }

    console.log("Upload response:", responseData);
  } catch (error) {
    console.error('Error during upload:', error);
  }
}

function takeScreenShot() {
  screenshot().then((img) => {
    const imageBlob = new Blob([img], { type: "image/png" });
    uploadImage(imageBlob);
  });
}

keyboard.addListener((event) => {
  if (
    attendanceData &&
    attendanceData.isPunchIn === true &&
    attendanceData.isBreakIn === false
  ) {
    if (event.state === "UP") {
      if (event.name.includes("MOUSE")) {
        mouseEventCount = mouseEventCount + 1;
      } else {
        keyboardKeyPressCount = keyboardKeyPressCount + 1;
      }
      // console.log(`Key Pressed: ${event.name}, Event Type: ${event.state}`);
      // console.log(`Key Pressed Count: ${keyboardKeyPressCount}, Mouse Event Count: ${mouseEventCount}`);
    }
  }
});

module.exports = { captureAndUpload };
