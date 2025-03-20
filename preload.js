const { contextBridge, ipcRenderer, shell } = require("electron");
const storage = require('node-persist');
// const { environment } = require("./util");

(async () => {
  await storage.init();
})();

console.log("Preload script loaded!");

let userData = {};
let attendanceData = {};

contextBridge.exposeInMainWorld("electron", {
  callApi: (dataUrlMain) => ipcRenderer.send("call-api", { dataUrlMain }),
  // openExternal: (endPoint) => shell.openExternal(environment.webUrl + endPoint),
  setUserData: async (data) => {
    const dataObj = {
      jwtToken: data.jwtToken,
      _id: data.data._id,
      fullName: data.data.fullName,
      emailAddress: data.data.emailAddress,
      role: data.data.role,
      profilePhoto: data.data.profilePhoto,
      approvalStatus: data.data.approvalStatus,
      isActive: data.data.isActive,
    };
    ipcRenderer.send("on-login", dataObj);
    await storage.setItem("userData", dataObj);
    ipcRenderer.send("userData", dataObj);
  },
  getUserData: async () => {
    userData = await storage.getItem("userData");
    return userData;
  },
  getAttendanceData: async () => {
    const data = await storage.getItem("attendanceData");
    return data;
  },
  setAttendanceData: async (data) => { 
    attendanceData = data;
    await storage.setItem("attendanceData", data);
    ipcRenderer.send("attendanceData", attendanceData);
   },
  openTasksWindow: (data) => {
    ipcRenderer.send("openTasksWindow", data);
  },
  onLogout: async () => {
    await storage.clear();
  },
});