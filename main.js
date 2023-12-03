function checkUserAuthorization() {
  let accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "./index.html";
  } else {
    getProfile();
  }
}

function redirectUser(page) {
  window.location.href = "./" + page;
}

function toggleDisplay(selector) {
  const element = document.querySelector(selector);
  if (element.style.display == "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

function toggleDropdownDisplayOnHover() {
  const buttonElement = document.querySelector("#button-dropdown");
  const containerElement = document.querySelector("#dropdown-container");
  const dropdownElement = document.querySelector("#menu-dropdown");

  buttonElement.addEventListener("mouseover", function () {
    containerElement.classList.add("active");
  });
  document.addEventListener("click", function () {
    containerElement.classList.remove("active");
  });
}

async function listenPlaylistChoice() {
  const dropDownChoice = document.querySelector("#playlistDropDown").value;
  if (dropDownChoice != "noneSelected") {
    const data = await getPlaylistData(dropDownChoice);
    loadPlaylistData(data);
    clearTable();
  }
}

function clientLogOut() {
  localStorage.clear();
  window.location.href = "./index.html";
}

async function getProfile() {
  const accessToken = localStorage.getItem("access_token");

  const callURL = "https://api.spotify.com/v1/me";

  fetch(callURL, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      handleProfileData(data);
    })
    .catch((error) => {
      console.error("Error fetching profile data", error);
    });
}

async function getPlaylistData(playlistID) {
  const accessToken = localStorage.getItem("access_token");
  const callURL = "https://api.spotify.com/v1/playlists/" + playlistID;

  return fetch(callURL, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching playlist data", error);
    });
}

async function getPlaylists() {
  const accessToken = localStorage.getItem("access_token");
  const callURL = "https://api.spotify.com/v1/me/playlists?limit=50";

  fetch(callURL, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      handlePlaylistResponse(data);
    })
    .catch((error) => {
      console.error("Error fetching playlist data", error);
    });
}

async function GetPlaylistTracks(itemNumber, playlistID) {
  const accessToken = localStorage.getItem("access_token");

  let callCount = Math.floor(itemNumber / 50);

  if (itemNumber % 50 > 0) {
    callCount += 1;
  }

  let CountToCall = 0;
  let offset = 0;

  for (let i = 0; i < callCount; i++) {
    if (itemNumber > 50) {
      countToCall = 50;
    } else {
      countToCall = itemNumber;
    }

    const callURL =
      "https://api.spotify.com/v1/playlists/" +
      playlistID +
      "/tracks" +
      "?limit=" +
      countToCall +
      "&offset=" +
      offset;

    await fetch(callURL, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        localStorage.setItem(`trackData`, JSON.stringify(data));
        handlePlaylistSongsResponse(data, i);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    offset += 50;
    itemNumber -= 50;
  }
}

async function loadPlaylistData(data) {
  const imageElement = document.querySelector("#playlistImage");
  const nameElement = document.querySelector("#playlistName");
  const infoElement = document.querySelector("#playlistInfo");
  const linkElement = document.querySelector("#playlistLink");

  const playlistName = data.name;
  const playlistInfo = data.description;
  const playlistImage = data.images[0].url;
  const playlistLink = data.external_urls.spotify;
  const trackAmount = data.tracks.total;
  const playlistID = data.id;

  await GetPlaylistTracks(trackAmount, playlistID);
  nameElement.textContent = playlistName;
  imageElement.setAttribute("src", playlistImage);
  linkElement.setAttribute("href", playlistLink);
  linkElement.style.display = "block";
  if (playlistInfo == "") {
    infoElement.textContent =
      "Author has not given any information about this playlist :'(";
  } else {
    infoElement.textContent = playlistInfo;
  }
  paginateItems();
}

function handlePlaylistResponse(data) {
  const playlists = data.items;
  const playlistDropDown = document.querySelector("#playlistDropDown");

  playlists.forEach((element) => {
    const playlistName = element.name;
    const playlistID = element.id;
    const dropDownOption = document.createElement("option");

    dropDownOption.textContent = playlistName;
    dropDownOption.setAttribute("value", playlistID);
    playlistDropDown.appendChild(dropDownOption);
  });
}

function handlePlaylistSongsResponse(data) {
  const songs = data.items;
  const tableDiv = document.querySelector(".song-display");
  const table = document.getElementById("table-element");
  const tableBody = document.getElementById("table-body");

  songs.forEach((element) => {
    let albumCover = element.track.album.images[2].url;
    let artist = element.track.artists[0].name;
    let songName = element.track.name;
    let albumName = element.track.album.name;
    let dateAdded = element.added_at.slice(0, 10);
    if (dateAdded == "1970-01-01") {
      dateAdded = "";
    }
    let durationMS = element.track.duration_ms;
    const durationDate = new Date(durationMS);
    let duration = durationDate.getMinutes() + ":";

    if (durationDate.getSeconds() < 10) {
      duration += "0" + durationDate.getSeconds();
    } else {
      duration += durationDate.getSeconds();
    }

    let trackLink = element.track.external_urls.spotify;
    let trackItems = [artist, songName, albumName, dateAdded, duration];

    const tableRow = document.createElement("tr");
    tableRow.setAttribute("class", "hover:bg-primaryDark");
    const tableCell = document.createElement("td");
    const img = document.createElement("img");
    img.src = albumCover;
    tableCell.appendChild(img);
    tableRow.appendChild(tableCell);

    trackItems.forEach((element) => {
      const tableCell = document.createElement("td");
      tableCell.appendChild(document.createTextNode(element));
      tableRow.appendChild(tableCell);
    });

    const linkCell = document.createElement("td");
    const hrefLink = document.createElement("a");

    hrefLink.href = trackLink;
    hrefLink.target = "_blank";
    hrefLink.textContent = "Link";

    linkCell.appendChild(hrefLink);
    tableRow.appendChild(linkCell);
    tableBody.appendChild(tableRow);
    table.appendChild(tableBody);
    tableDiv.appendChild(table);
  });
}

function handleProfileData(data) {
  const userName = data.display_name;
  const userProfilePicture = data.images[0].url;
  const userNameField = document.getElementById("profile-name");
  const userPictureField = document.getElementById("profile-picture");

  if (window.location.pathname === "/profile.html") {
    userNameField.textContent = `${userName}'s Profile`;
    const userImage = document.querySelector("#userImage");
    const image = data.images[1].url;
    userImage.setAttribute("src", image);
  } else {
    userNameField.textContent = `Welcome to Muzify, ${userName}!`;
  }
  userPictureField.setAttribute("src", userProfilePicture);
}

function clearTable() {
  const oldTableBody = document.getElementById("table-body");
  oldTableBody.remove("tr");

  const table = document.getElementById("table-element");
  const newTableBody = document.createElement("tbody");
  newTableBody.setAttribute("id", "table-body");

  table.appendChild(newTableBody);
}

//Pagination implementation
function paginateItems() {
  // const table = document.getElementById("table-element");
  // const tbody = table.getElementsByTagName("tbody");
  const tableBody = document.getElementById("table-body");

  const sortOptions = document.getElementsByName("pageAmount");
  let amountToShow = 0;
  for (let i = 0; i < sortOptions.length; i++) {
    if (sortOptions[i].checked) {
      amountToShow = Number.parseInt(sortOptions[i].value);
    }
  }

  let arrayOfSongs = [];

  for (let row of tableBody.rows) {
    arrayOfSongs.push(row);
  }
  const topBackButton = document.getElementById("topPaginateBackButton");
  const topNextButton = document.getElementById("topPaginateNextButton");
  const botBackButton = document.getElementById("botPaginateBackButton");
  const botNextButton = document.getElementById("botPaginateNextButton");

  const pageCounter = document.getElementById("topPageNumber");
  const botPageCounter = document.getElementById("botPageNumber");

  if (amountToShow < 1000 && amountToShow < arrayOfSongs.length) {
    topBackButton.style.display = "block";
    topNextButton.style.display = "block";
    botBackButton.style.display = "block";
    botNextButton.style.display = "block";
    pageCounter.style.display = "block";
    botPageCounter.style.display = "block";
  }
  let currentPage = 0;
  tableBody.setAttribute("value", currentPage);
  pageCounter.innerHTML = currentPage + 1;
  botPageCounter.innerHTML = currentPage + 1;

  for (let i = 0; i < arrayOfSongs.length; i++) {
    if (i >= amountToShow) {
      arrayOfSongs[i].style.display = "none";
    }
  }
}

function changePage(page) {
  const tableBody = document.getElementById("table-body");
  const topPageCounter = document.getElementById("topPageNumber");
  const botPageCounter = document.getElementById("botPageNumber");
  let arrayOfSongs = [];

  const sortOptions = document.getElementsByName("pageAmount");
  let amountToShow = 0;
  for (let i = 0; i < sortOptions.length; i++) {
    if (sortOptions[i].checked) {
      amountToShow = Number.parseInt(sortOptions[i].value);
    }
  }

  for (let row of tableBody.rows) {
    arrayOfSongs.push(row);
  }

  let currentPage = Number.parseInt(tableBody.getAttribute("value"));
  let lastPage = Math.ceil(arrayOfSongs.length / amountToShow) - 1;
  if (page > 0 && currentPage != lastPage) {
    currentPage += 1;
  } else if (page < 0 && currentPage != 0) {
    currentPage -= 1;
  }

  const startIndex = currentPage * amountToShow;
  console.log(startIndex);
  const endIndex = startIndex + amountToShow;
  console.log(endIndex);

  for (let i = 0; i < arrayOfSongs.length; i++) {
    if (i >= startIndex && i < endIndex) {
      arrayOfSongs[i].style.display = "table-row";
    } else {
      arrayOfSongs[i].style.display = "none";
    }
  }
  tableBody.setAttribute("value", currentPage);
  topPageCounter.innerHTML = currentPage + 1;
  botPageCounter.innerHTML = currentPage + 1;
}

function downloadCSV() {
  const table = document.getElementById("table-element");

  let rows = [];
  const csvHeadings = [
    "Artist",
    "Song Name",
    "Album",
    "Date Added",
    "Duration",
  ];
  rows.push(csvHeadings.join(","));
  for (let i = 1; i < table.rows.length; i++) {
    let row = [];
    for (let j = 1; j < table.rows[i].cells.length - 1; j++) {
      row.push("`" + table.rows[i].cells[j].innerText + "`");
    }
    rows.push(row.join(","));
  }

  let csvContent = rows.join("\n");

  let blob = new Blob([csvContent], { type: "text/csv" });

  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = document.getElementById("playlistName").innerHTML + ".csv";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

//Initial page load checks for authorization, gets necessary information for page.
window.addEventListener(
  "load",
  checkUserAuthorization(),
  toggleDropdownDisplayOnHover(),
  getPlaylists()
);
