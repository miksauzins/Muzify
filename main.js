function checkUserAuthorization() {
  let accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    redirectUser("index.html");
  } else {
    getProfile();
  }
}

function redirectUser(page) {
  window.location.href = "./" + page;
}

function toggleDisplay(selector, displayType = "block") {
  const element = document.querySelector(selector);
  if (element.style.display == "none") {
    element.style.display = displayType;
  } else {
    element.style.display = "none";
  }
}

function toggleDropdownDisplayOnHover() {
  const buttonElement = document.querySelector("#button-dropdown");
  const containerElement = document.querySelector("#dropdown-container");

  buttonElement.addEventListener("mouseover", function () {
    containerElement.classList.add("active");
  });
  document.addEventListener("click", function () {
    containerElement.classList.remove("active");
  });
}

async function listenPlaylistChoice() {
  toggleDisplay("#tableSpinner", "flex");
  const dropDownChoice = document.querySelector("#playlistDropDown").value;
  const table = document.querySelector("#table-element");
  const recContainer = document.querySelector("#recommendationListContainer");
  const recButton = document.querySelector("#recButton");
  const refreshRecButton = document.querySelector("#refreshRecButton");

  if (dropDownChoice != "noneSelected") {
    if (recButton.style.display == "none") {
      recButton.style.display = "block";
    }
    if (recContainer.style.display != "none") {
      recContainer.style.display = "none";
      refreshRecButton.style.display = "none";
    }

    const data = await getPlaylistData(dropDownChoice);
    loadPlaylistData(data);
    toggleDisplay("#tableSpinner");
    clearTable();
    clearList("#recommendationList");
  }
}

function reloadPaginatedItems() {
  // Paginate items with newly set amount of songs to show.
  paginateItems();
  reloadTablePage();
}

function reloadTablePage() {
  // A way I found to reload elements in the table.
  // Add 1 and then remove 1 since nothing happens in the called function if page is already 1.
  changePage(1);
  changePage(-1);
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

  let fullSongList = [];

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

    const response = await fetch(callURL, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });

    const playlistSongs = await response.json().catch((error) => {
      console.error(error);
    });
    handlePlaylistSongsResponse(playlistSongs);
    fullSongList.push(playlistSongs);

    offset += 50;
    itemNumber -= 50;
  }
  if (document.querySelector("#table-element").style.display == "none") {
    document.querySelector("#table-element").style.display = "table";
  }
  sessionStorage.setItem("playlistTracks", JSON.stringify(fullSongList));
}

//Get several tracks by their IDs, 'ids' should be comma-separated string.
async function getTracksByIDs(ids) {
  const accessToken = localStorage.getItem("access_token");

  const callURL = "https://api.spotify.com/v1/tracks?ids=" + ids;

  const songData = await fetch(callURL, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error fetching track data", error);
    });
  return songData;
}

async function getRecommendations(data) {
  const allTracks = data.items;
  let songIDs = [];
  allTracks.forEach((trackObject) => {
    songIDs.push(trackObject.track.id);
  });

  const accessToken = localStorage.getItem("access_token");

  // Divide array of song ids into multiple chunks consisting of max 5 ids.
  let chunkSize = 5;
  let chunkedSongs = [];
  while (songIDs.length > 0) {
    chunkedSongs.push(songIDs.splice(0, chunkSize));
  }

  let resultArray = [];
  for (const ids of chunkedSongs) {
    const URLsongs = ids.join(",");

    const callURL =
      "https://api.spotify.com/v1/recommendations?seed_tracks=" + URLsongs;

    const response = await fetch(callURL, {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    }).catch((error) => {
      console.error(error);
    });
    const result = await response.json();
    resultArray.push(result);
  }
  return resultArray;
}

function addTrackToPlaylist(trackID) {
  const accessToken = localStorage.getItem("access_token");

  const playlistID = document.querySelector("#playlistDropDown").value;
  const trackURI = "spotify:track:" + trackID;

  const callURL =
    "https://api.spotify.com/v1/playlists/" + playlistID + "/tracks";

  fetch(callURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    },
    body: JSON.stringify({ uris: [trackURI] }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function initRecommendations() {
  toggleDisplay("#recListSpinner", "flex");
  let recommendationList = [];
  const playlistSongsArray = JSON.parse(
    sessionStorage.getItem("playlistTracks")
  );
  for (data of playlistSongsArray) {
    const arr = await getRecommendations(data);
    recommendationList.push(arr);
  }
  let idList = transformRecommendationsIntoIDs(recommendationList);
  const sortedIdList = sortRecommendations(idList);
  let sortedIdArray = Object.keys(sortedIdList);

  const retrievableSongs = sortedIdArray.splice(0, 5).join(",");
  const songs = await getTracksByIDs(retrievableSongs);

  handleRecommendedSongDisplay(songs);

  const retrievableSongsArray = retrievableSongs.split(",");
  sortedIdArray.push(...retrievableSongsArray);
  window.sessionStorage.setItem(
    "RecommendedIDs",
    JSON.stringify(sortedIdArray)
  );

  toggleDisplay("#recommendationListContainer", "flex");
  toggleDisplay("#refreshRecButton");
  toggleDisplay("#recButton");
  toggleDisplay("#recListSpinner");
}

async function refreshRecommendations() {
  const IdArray = JSON.parse(window.sessionStorage.getItem("RecommendedIDs"));
  const retrievableSongs = IdArray.splice(0, 5).join(",");
  const songs = await getTracksByIDs(retrievableSongs);
  handleRecommendedSongDisplay(songs);
  const retrievableSongsArray = retrievableSongs.split(",");
  IdArray.push(...retrievableSongsArray);
  window.sessionStorage.setItem("RecommendedIDs", JSON.stringify(IdArray));
}

function clearList(selector) {
  const listToClear = document.querySelector(selector);
  while (listToClear.firstChild) {
    listToClear.removeChild(listToClear.firstChild);
  }
}

function handleRecommendedSongDisplay(data) {
  const tracks = data.tracks;
  const recommendationListContainer = document.querySelector(
    "#recommendationListContainer"
  );
  let recommendationList = document.querySelector("#recommendationList");
  clearList("#recommendationList");

  tracks.forEach((songObject) => {
    console.log(songObject);
    const listElement = document.createElement("li");
    listElement.setAttribute(
      "class",
      "px-4 py-1 hover:bg-primary last:border-none border-gray-200 transition-all duration-200 ease-in-out"
    );
    const containerDiv = document.createElement("div");
    containerDiv.setAttribute("class", "flex w-full align-middle");

    const imageElement = document.createElement("img");
    imageElement.setAttribute("src", songObject.album.images[0].url);
    imageElement.setAttribute("class", "relative -left-4 h-auto w-14");
    containerDiv.appendChild(imageElement);

    const informationDiv = document.createElement("div");
    informationDiv.setAttribute("class", "flex flex-col mx-8");

    const songName = document.createElement("h3");
    songName.setAttribute("class", "text-lg text-white");
    songName.textContent = songObject.name;
    informationDiv.appendChild(songName);

    const songArtist = document.createElement("p");
    songArtist.setAttribute("class", "text-sm text-neutral");
    songArtist.textContent = songObject.artists[0].name;
    informationDiv.appendChild(songArtist);
    containerDiv.appendChild(informationDiv);

    const actionDiv = document.createElement("div");
    actionDiv.setAttribute("class", "flex ml-auto mr-5 items-center");

    const songDuration = document.createElement("p");
    songDuration.setAttribute("class", "text-neutral text-lg");

    let durationMS = songObject.duration_ms;
    const durationDate = new Date(durationMS);
    let duration = durationDate.getMinutes() + ":";
    if (durationDate.getSeconds() < 10) {
      duration += "0" + durationDate.getSeconds();
    } else {
      duration += durationDate.getSeconds();
    }

    songDuration.textContent = duration;
    actionDiv.appendChild(songDuration);

    const playButton = document.createElement("button");
    const playSVG = document.createElement("img");
    playSVG.setAttribute("src", "icons/play-button.svg");
    playSVG.setAttribute("class", "w-8 h-auto mx-2");
    playButton.appendChild(playSVG);

    const audioElement = document.createElement("audio");
    // audioElement.setAttribute("controls", "");
    const sourceElement = document.createElement("source");
    sourceElement.setAttribute("src", songObject.preview_url);
    sourceElement.setAttribute("type", "audio/mpeg");
    audioElement.appendChild(sourceElement);
    playButton.appendChild(audioElement);
    let isPlaying = false;
    playButton.addEventListener("click", () => {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      isPlaying = !isPlaying;
    });
    actionDiv.appendChild(playButton);

    //Refactor the volume bar and audio player into one single audio player
    //Current one allows user to play each song simultaneously, which is not good
    // const volumeBar = document.createElement("input");
    // volumeBar.setAttribute("type", "range");
    // volumeBar.setAttribute("min", "0");
    // volumeBar.setAttribute("max", "1");
    // volumeBar.setAttribute("step", "0.01");
    // volumeBar.setAttribute("value", "0.5");
    // volumeBar.setAttribute("class", "mx-2 w-3");
    // volumeBar.setAttribute("title", "Volume Bar");
    // volumeBar.addEventListener("input", () => {
    //   audioElement.volume = volumeBar.value;
    // });
    // actionDiv.appendChild(volumeBar);

    const addButton = document.createElement("button");
    addButton.innerHTML = "Add";
    const trackID = songObject.id;
    addButton.setAttribute("onclick", `addTrackToPlaylist("${trackID}")`);

    addButton.addEventListener("click", () => {
      addTrackToPlaylist(`${trackID}`);
      addRecTrackToTable(songObject);
    });

    actionDiv.appendChild(addButton);
    containerDiv.appendChild(actionDiv);

    listElement.appendChild(containerDiv);
    recommendationList.appendChild(listElement);
  });
  recommendationListContainer.appendChild(recommendationList);
}

function addRecTrackToTable(data) {}

function transformRecommendationsIntoIDs(data) {
  let idArray = [];
  data.forEach((array) => {
    array.forEach((recObject) => {
      recObject.tracks.forEach((track) => {
        idArray.push(track.id);
      });
    });
  });
  return idArray;
}

function sortRecommendations(data) {
  let idCountMap = {};

  data.forEach((id) => {
    idCountMap[id] = (idCountMap[id] || 0) + 1;
  });

  const sortedObjectArray = Object.entries(idCountMap).sort(
    (x, y) => y[1] - x[1]
  );
  // console.log("sorted array: ", sortedObjectArray);
  const sortedObject = Object.fromEntries(sortedObjectArray);

  return sortedObject;
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
  console.log(data);
  const songs = data.items;
  const tableDiv = document.querySelector("#paginated-list");
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
    tableRow.setAttribute(
      "class",
      "hover:bg-primaryDark transition-all duration-200 ease-in-out"
    );
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
  const endIndex = startIndex + amountToShow;

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
