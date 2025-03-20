import {
  hideLoader,
  showToast,
  fetchApi,
} from "../util.js";

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("signup_btn").addEventListener("click", () => {
    window.electron.openExternal("/signup");
  });

  document.getElementById("forgot_password").addEventListener("click", () => {
    window.electron.openExternal("/sendEmailOtp");
  });

  const handleLogin = async () => {
    const loginId = document.getElementById("loginId").value;
    const password = document.getElementById("password").value;

    if (!loginId || !password) {
      showToast("Please enter email and password.", "error");
      return;
    }

    const requestData = {
      loginId,
      password,
    };

    await fetchApi({
      url: endPoints.login,
      method: "POST",
      data: requestData,
      onSuccess: (data) => {
        showToast(data.message, "success");
        window.electron.setUserData(data);
        setTimeout(() => {
          window.location.href = "./tracking.html";
          hideLoader();
        }, 500);
      },
    });
  }

  document.getElementById("login_btn").addEventListener("click", handleLogin);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleLogin();
    }
});

  const showHiddenPassword = () => {
    const input = document.getElementById("password"),
      iconEye = document.getElementById("input-icon");

    iconEye.addEventListener("click", () => {
      if (input.type === "password") {
        input.type = "text";

        // iconEye.classList.add("ri-eye-line");
        // iconEye.classList.remove("ri-eye-off-line");

        iconEye.classList.add("passShow");
        iconEye.classList.remove("passHide");
      } else {
        input.type = "password";

        // iconEye.classList.remove("ri-eye-line");
        // iconEye.classList.add("ri-eye-off-line");

        iconEye.classList.remove("passShow");
        iconEye.classList.add("passHide");
      }
    });
  };

  showHiddenPassword();
});
