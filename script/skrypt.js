if (localStorage.getItem("tryb_nocny") === "on") {
  document.body.classList.add("tryb_nocny");
}

function tryb_nocny() {
  document.body.classList.toggle("tryb_nocny");

  if (document.body.classList.contains("tryb_nocny")) {
    localStorage.setItem("tryb_nocny", "on");
  } else {
    localStorage.setItem("tryb_nocny", "off");
  }
}