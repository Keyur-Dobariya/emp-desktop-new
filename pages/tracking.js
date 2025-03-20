import {
  showLoader,
  userData,
  attendanceData,
  getWorkPercentage,
  fetchApi,
  setUserData,
  setAttendanceData,
  postAttendanceData,
  formatTime,
} from "../util.js";

document.addEventListener("DOMContentLoaded", async () => {
  showLoader();
  const profileImage = document.getElementById("profileImage");
  const userName = document.getElementById("userName");
  const userEmail = document.getElementById("userEmail");
  const userDetail = document.querySelector(".userDetail");
  const trackingInfo = document.querySelector(".trackingInfo");
  const dateTime = document.querySelector(".dateTime");
  const currentTask = document.querySelector(".currentTask");
  const punchInBtn = document.querySelector(".punchInBtn");
  const breakInBtn = document.querySelector(".breakInBtn");
  const punchInBtnTxt = document.querySelector(".punchInBtnTxt");
  const breakInBtnTxt = document.querySelector(".breakInBtnTxt");
  const totalHourTxt = document.querySelector(".totalHourTxt");
  const punchinAtTxt = document.querySelector(".punchinAtTxt");
  const breakTxt = document.querySelector(".breakTxt");
  const progressIndicator = document.querySelector("#progressIndicator");
  const progressCircle = document.querySelector(
    ".trackingProgressBar circle:nth-of-type(2)"
  );

  const addTaskBtn = document.querySelector(".addTaskBtn");
  const logoutBtn = document.querySelector(".logoutBtn");
  const closeBtn = document.querySelector(".closeBtn");
  const appLogoutBtn = document.querySelector(".appLogoutBtn");
  const myModal = new bootstrap.Modal(document.getElementById("myModal"));

  addTaskBtn.addEventListener("click", function () {
    window.electron.openTasksWindow(attendanceData);
  });

  logoutBtn.addEventListener("click", function () {
    myModal.show();
  });

  closeBtn.addEventListener("click", function () {
    myModal.hide();
  });

  appLogoutBtn.addEventListener("click", function () {
    window.electron.onLogout();
    myModal.hide();
    window.location.href = "./login.html";
  });

  if (window.electron) {
    // userData = await window.electron.getUserData();
    window.electron.getUserData().then(async (data) => {
      setUserData(data);
      window.electron.setUserData(data);

      if (userData.emailAddress) {
        userDetail.setAttribute("title", userData.emailAddress);
      }

      if (userData.fullName) {
        userName.innerText = userData.fullName;
      } else {
        userName.style.display = "none";
      }

      if (userData.role) {
        userEmail.innerText = userData.role;
      } else {
        userEmail.style.display = "none";
      }

      profileImage.src =
        userData.profilePhoto || "../assets/image/profile_placeholder.png";

      await fetchApi({
        url: endPoints.getTodayAttendance + userData._id,
        onSuccess: (data) => {
          setAttendanceData(data.data);
          window.electron.setAttendanceData(attendanceData);

          if (attendanceData.breakHours) {
            breakTxt.textContent =
              "Break Hours: " + formatTime(attendanceData.breakHours);
          } else {
            breakTxt.textContent = "Break Hours: 0h 0m 0s";
          }

          if (attendanceData.totalHours) {
            totalHourTxt.textContent = formatTime(attendanceData.totalHours);
          } else {
            totalHourTxt.innerText = "0h 0m 0s";
          }
        },
      });
    });
  }

  punchInBtn.addEventListener("click", async () => {
    let postData;
    if (attendanceData.isPunchIn) {
      postData = {
        punchOutTime: Date.now(),
      };
    } else {
      postData = {
        punchInTime: Date.now(),
      };
    }
    postAttendanceData(postData);
  });

  breakInBtn.addEventListener("click", () => {
    let postData;
    if (attendanceData.isBreakIn) {
      postData = {
        breakOutTime: Date.now(),
      };
    } else {
      postData = {
        breakInTime: Date.now(),
      };
    }
    postAttendanceData(postData);
  });

  const breakCalculation = (data) => {
    return Date.now() - data.lastBreakInTime + Number(data.breakHours);
  };

  const totalCalculation = (data) => {
    return Date.now() - data.lastPunchInTime + Number(data.totalHours);
  };

  function updateDateTime() {
    window.electron.getAttendanceData().then(async (data) => {
      const now = new Date();

      const attendanceData = data;

      const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      dateTime.innerText = `${formattedTime} - ${formattedDate}`;

      const hourPercentage =
        getWorkPercentage(totalCalculation(attendanceData)) || 0;

      if (hourPercentage <= 100) {
        progressIndicator.style.strokeDashoffset =
          (1 - hourPercentage / 100) * (2 * (22 / 7) * 40);
      }

      if (attendanceData.punchInAt) {
        const punchInDate = new Date(attendanceData.punchInAt);
        if (!isNaN(punchInDate.getTime())) {
          const formattedTime = punchInDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          punchinAtTxt.textContent = `Punch In At: ${formattedTime}`;
        } else {
          punchinAtTxt.textContent = "Punch In At: None";
        }
      } else {
        punchinAtTxt.textContent = "Punch In At: None";
      }

      trackingInfo.style.backgroundColor = "var(--white-color)";
      trackingInfo.style.border = "none";

      if (
        attendanceData &&
        Array.isArray(attendanceData.tasks) && attendanceData.tasks.length > 0
      ) {
        currentTask.textContent = "Task: " + attendanceData.tasks[attendanceData.tasks.length - 1].title;
        currentTask.style.cursor = "pointer";
        // new bootstrap.Popover(currentTask, {
        //   trigger: "hover focus",
        //   content: attendanceData.tasks[attendanceData.tasks.length - 1].description,
        //   placement: "bottom",
        // });
        currentTask.setAttribute("title", attendanceData.tasks[attendanceData.tasks.length - 1].description);
      }

      if (attendanceData.isPunchIn) {
        trackingInfo.style.border = "1.5px solid var(--primary-color)";
        trackingInfo.style.backgroundColor = "var(--primary-color-bg)";
        progressCircle.style.stroke = "var(--primary-color)";
        punchInBtnTxt.textContent = "Punch Out";
        totalHourTxt.textContent = formatTime(totalCalculation(attendanceData));
      } else {
        punchInBtnTxt.textContent = "Punch In";
      }

      if (attendanceData.isBreakIn) {
        trackingInfo.style.border = "1.5px solid var(--error-color)";
        trackingInfo.style.backgroundColor = "var(--error-color-bg)";
        progressCircle.style.stroke = "var(--error-color)";
        breakInBtnTxt.textContent = "Break Out";
        breakTxt.textContent =
          "Break Hours: " + formatTime(breakCalculation(attendanceData));
      } else {
        breakInBtnTxt.textContent = "Break In";
      }
    });
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
});
