let timerActive = false;
let timerId = null;
let timerId2 = null;

function startTimer(intervalMinutes, eventTriggered) {
  if (timerActive) {
    // console.log("Timer is already running!");
    return;
  }

  timerActive = true;

  const scheduleNextEvent = () => {
    if (!timerActive) return;

    const startTime = new Date();
    const endEventTime = new Date(
      startTime.getTime() + intervalMinutes * 60000
    );

    const randomTime = new Date(
      startTime.getTime() +
        Math.random() * (endEventTime.getTime() - startTime.getTime())
    );

    console.log(
      "Start Event:",
      startTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
    console.log(
      "Random Time:",
      randomTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );
    console.log(
      "End Event:",
      endEventTime.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    );

    timerId = setTimeout(() => {
      if (!timerActive) return;
      console.log(
        "Random Event Triggered at:",
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      eventTriggered();
    }, randomTime - startTime);

    timerId2 = setTimeout(() => {
      if (!timerActive) return;
      console.log("\n--- Starting Next Cycle ---\n");
      scheduleNextEvent();
    }, endEventTime - startTime);
  };

  scheduleNextEvent();
}

function stopTimer() {
  if (!timerActive) {
    // console.log("Timer is not running!");
    return;
  }

  timerActive = false;
  clearTimeout(timerId);
  clearTimeout(timerId2);
  // console.log("Timer stopped.");
}

module.exports = { startTimer, stopTimer };
