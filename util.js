// const apiBaseUrlDev = "http://192.168.0.104:5201";
// const webUrlDev = "http://192.168.0.104:3000";
// const socketUrlDev = "ws://192.168.0.104:5201";
// const apiBaseUrlProd = "https://empbackend-16ns.onrender.com";
// const webUrlProd = "https://whogetsa.web.app/";
// const socketUrlProd = "wss://empbackend-16ns.onrender.com";

// const isDev = true;

// export const environment = {
//   apiBaseUrl: isDev ? apiBaseUrlDev : apiBaseUrlProd,
//   webUrl: isDev ? webUrlDev : webUrlProd,
//   socketUrl: isDev ? socketUrlDev : socketUrlProd,
// };

// export const endPoints = {
//   login: environment.apiBaseUrl + "/auth/login",
//   getTodayAttendance: environment.apiBaseUrl + "/api/getTodayAttendance/",
//   addAttendance: environment.apiBaseUrl + "/api/addAttendance",
// };

export let userData = {};
export let attendanceData = {};

export function setUserData(data) {
  userData = data;
}

export function setAttendanceData(data) {
  attendanceData = data;
}

export function showLoader() {
  const loaderOverlay = document.getElementById("loader-overlay");
  if (loaderOverlay) {
    loaderOverlay.style.display = "flex";
  }
}

export function hideLoader() {
  const loaderOverlay = document.getElementById("loader-overlay");
  if (loaderOverlay) {
    loaderOverlay.style.display = "none";
  }
}

export function showToast(message, type = "success") {
  const toastContainer = document.getElementById("toast-container");
  if (toastContainer) {
    const toast = document.createElement("div");
    toast.classList.add(
      "toast-message",
      type === "success" ? "toast-success" : "toast-error"
    );
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
}

export function getWorkPercentage(totalWorkedMillisecond) {
  const totalOfficeMilliseconds = 9 * 60 * 60 * 1000;

  const percentage = (totalWorkedMillisecond / totalOfficeMilliseconds) * 100;
  return percentage.toFixed(2);
}

export function formatTime(milliseconds) {
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

export async function postAttendanceData(postData) {
  const requestData = {
    userId: userData._id,
    ...postData,
  };
  await fetchApi({
    url: endPoints.addAttendance,
    method: "POST",
    data: requestData,
    onSuccess: (data) => {
      setAttendanceData(data.data);
      window.electron.setAttendanceData(attendanceData);
    },
  });
}

export async function fetchApi({
  url,
  method = "GET",
  data = null,
  onSuccess,
}) {
  showLoader();
  const headers = { "Content-Type": "application/json" };
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    hideLoader();
    if (result.success === true) {
      onSuccess(result);
    } else {
      showToast(result.message, "error");
    }
  } catch (error) {
    hideLoader();
    showToast("API error occurred-" + error.message, "error");
    console.log(error);
  }
}
