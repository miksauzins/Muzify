function navButtonClick() {
  let navList = document.querySelector(".nav-list");
  const className = "active";
  if (navList.classList.contains(className)) {
    navList.classList.remove(className);
  } else {
    navList.classList.add(className);
  }
}

function modifyText() {
  let text = document.getElementById("main-text");
  text.style.fontFamily = "sans-serif";
  text.style.fontSize = "2rem";
  text.style.color = "red";
}

function checkUserAuthorization() {
  let accessToken = localStorage.getItem("access_token");
  if (accessToken) {
    console.log("Reached function");
    window.location = "./main.html";
  }
}

let button = document.getElementById("main-button");
button.addEventListener("click", modifyText);

window.addEventListener("load", checkUserAuthorization());
