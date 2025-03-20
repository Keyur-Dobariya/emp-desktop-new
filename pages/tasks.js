import {
  attendanceData,
  fetchApi,
  setAttendanceData,
  setUserData,
  showToast,
  userData,
} from "../util.js";

document.addEventListener("DOMContentLoaded", async function () {
  setUserData(await window.electron.getUserData());
  await fetchApi({
    url: endPoints.getTodayAttendance + userData._id,
    onSuccess: (data) => {
      setAttendanceData(data.data);
      window.electron.setAttendanceData(attendanceData);
    },
  });

  console.log(userData);
  console.log(attendanceData);

  const addNewTaskBtn = document.querySelector(".addNewTaskBtn");
  const taskSubmitBtn = document.querySelector(".taskSubmitBtn");
  const closeBtn = document.querySelector(".closeBtn");
  const myModal = new bootstrap.Modal(document.getElementById("myModal"));

  addNewTaskBtn.addEventListener("click", function () {
    myModal.show();
  });

  taskSubmitBtn.addEventListener("click", async function () {
    const taskTitle = document.getElementById("taskTitle").value;
    const taskDescription = document.getElementById("taskDescription").value;

    if (!taskTitle || !taskDescription) {
      showToast("Please enter title and description.", "error");
      return;
    }

    const bodyObj = {
      userId: userData._id,
      taskTitle: taskTitle,
      taskDescription: taskDescription,
    };

    await fetchApi({
      url: endPoints.addAttendance,
      method: "POST",
      data: bodyObj,
      onSuccess: (data) => {
        showToast("Task added successfully.", "success");
        setAttendanceData(data.data);
        window.electron.setAttendanceData(attendanceData);
        myModal.hide();
        loadData();
      },
    });
  });

  closeBtn.addEventListener("click", function () {
    myModal.hide();
  });

  loadData();
});

function loadData() {
  const taskListContainer = document.getElementById("tasksPage");
  const taskTemplate = document.getElementById("taskTemplate").content;
  const noDataFoundTemplate = document.getElementById(
    "noDataFoundTemplate"
  ).content;

  taskListContainer.innerHTML = "";

  if (!attendanceData.tasks || attendanceData.tasks.length === 0) {
    const noDataFoundItem = noDataFoundTemplate.cloneNode(true);
    taskListContainer.appendChild(noDataFoundItem);
    return;
  }

  attendanceData.tasks.reverse().forEach((task) => {
    const taskItem = taskTemplate.cloneNode(true);
    const listItemCard = taskItem.querySelector(".listItemCard");

    taskItem.querySelector(".itemTitle").textContent = task.title;
    taskItem.querySelector(".itemBody").textContent = task.description;
    taskItem.querySelector(".startTime").textContent = formatCustomDate(
      task.startTime
    );
    taskItem.querySelector(".endTime").textContent = task.endTime
      ? formatCustomDate(task.endTime)
      : "Ongoing";

    if (!task.endTime) {
      listItemCard.style.border = "1.5px solid var(--primary-color)";
      listItemCard.style.backgroundColor = "var(--primary-color-bg)";
    }

    taskListContainer.appendChild(taskItem);
  });
}

function formatCustomDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const timeString = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${timeString}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeString}`;
  } else {
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${formattedDate} - ${timeString}`;
  }
}
