function checkUserAuthorization() {
  let accessToken = localStorage.getItem("access_token");
  if (!accessToken) {
    window.location.href = "./index.html";
  }
}

function toggleDisplay(selector) {
  const element = document.querySelector(selector);
  if (element.style.display == "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

function clientLogOut() {
  localStorage.clear();
  window.location.href = "./index.html";
}

document.getElementById("APIForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const itemNumber = document.getElementById("itemNumber").value;

  if (itemNumber <= 0) {
    alert("Please enter a valid number greater than 0.");
    return;
  } else if (itemNumber <= 50) {
    clearTable();
    getPlaylists(itemNumber);
  } else {
    clearTable();
    getMultiplePlaylists(itemNumber);
  }
  toggleDisplay(".table-element");
});

async function getPlaylists(itemNumber, offset = 0) {
  const accessToken = localStorage.getItem("access_token");

  // if (itemNumber > 50) {
  //   itemNumber = 50;
  // }

  const callURL =
    "https://api.spotify.com/v1/me/tracks" +
    "?limit=" +
    itemNumber +
    "&offset=" +
    offset;

  fetch(callURL, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // localStorage.setItem("trackData", JSON.stringify(data));
      handleLikedSongsResponse(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

async function getMultiplePlaylists(itemNumber) {
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
      "https://api.spotify.com/v1/me/tracks" +
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
        // localStorage.setItem(`trackData`, JSON.stringify(data));
        handleLikedSongsResponse(data, i);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });

    offset += 50;
    itemNumber -= 50;
  }
}

/**
 * TODO:
 *    1) refactor times called out of handleLikedSongsResponse -> do this check one function up where it is called
 *    2) factor in a separate function song table item creation / maybe create additional removal function
 *    3) table will always be on page -> do not create dynamically things that will most probably always be there
 *    4) create separate function that manages loader spinner state (toggleSpinner(state))
 *
 * Additional: in general if you see something that is a separate functionality (i.e. create song table item or change loader spinner status -> create separate function which works and just call it)
 */

function handleLikedSongsResponse(data) {
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
    // toggleDisplay(".ispinner");
    // toggleDisplay(".table-element");
  });
}

function clearTable() {
  const oldTableBody = document.getElementById("table-body");
  oldTableBody.remove("tr");

  const table = document.getElementById("table-element");
  const newTableBody = document.createElement("tbody");
  newTableBody.setAttribute("id", "table-body");

  table.appendChild(newTableBody);
  if (table.style.display == "block") {
    toggleDisplay(".table-element");
  }
}

//Pagination implementation

window.addEventListener("load", checkUserAuthorization());
