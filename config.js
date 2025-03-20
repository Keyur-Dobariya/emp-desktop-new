const config = {
  apiBaseUrlDev: "http://192.168.0.104:5201",
  webUrlDev: "http://192.168.0.104:3000",
  socketUrlDev: "ws://192.168.0.104:5201",
  apiBaseUrlProd: "https://empbackend-16ns.onrender.com",
  webUrlProd: "https://whogetsa.web.app/",
  socketUrlProd: "wss://empbackend-16ns.onrender.com",
  isDev: false,
};

const environment = {
  apiBaseUrl: config.isDev ? config.apiBaseUrlDev : config.apiBaseUrlProd,
  webUrl: config.isDev ? config.webUrlDev : config.webUrlProd,
  socketUrl: config.isDev ? config.socketUrlDev : config.socketUrlProd,
};
const endPoints = {
  login: environment.apiBaseUrl + "/auth/login",
  getTodayAttendance: environment.apiBaseUrl + "/api/getTodayAttendance/",
  addAttendance: environment.apiBaseUrl + "/api/addAttendance",
};

if (typeof window !== "undefined") {
  window.environment = environment;
  window.endPoints = endPoints;
} else {
  global.environment = environment;
  global.endPoints = endPoints;
}
