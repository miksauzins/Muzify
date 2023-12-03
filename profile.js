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
      console.log(data);
      handlePlaylistData(data);
    })
    .catch((error) => {
      console.error("Error fetching playlist data", error);
    });
}

function handlePlaylistData(data) {
  const playlistData = data.items;
  console.log(playlistData);
  const playlistTableDiv = document.querySelector("#playlistMenu");
  playlistData.forEach((element) => {
    const playlistDiv = document.createElement("div");
    playlistDiv.setAttribute(
      "class",
      "relative mx-5 px-3 py-2 justify-center items-center group duration-500 transition ease-in-out hover:scale-110"
    );
    const playlistImage = document.createElement("img");
    playlistImage.setAttribute("src", element.images[0].url);
    playlistImage.setAttribute("class", "h-60 w-60 rounded-2xl opacity-70");
    playlistDiv.appendChild(playlistImage);
    const playlistDescriptDiv = document.createElement("div");
    playlistDescriptDiv.setAttribute(
      "class",
      "absolute bottom-3 left-14 right-0 py-1 w-7/12 text-center transition ease-in-out bg-transparent rounded-full group-hover:scale-110 group-hover:bg-primaryLight group-hover:bg-opacity-80"
    );
    const playlistName = document.createElement("a");
    playlistName.setAttribute("class", "text-white text-center");
    playlistName.setAttribute("href", element.external_urls.spotify);
    playlistName.textContent = element.name;
    playlistDescriptDiv.appendChild(playlistName);
    playlistDiv.appendChild(playlistDescriptDiv);
    playlistTableDiv.appendChild(playlistDiv);
  });
}

async function getRecentlyPlayed() {
  const accessToken = localStorage.getItem("access_token");
  const callURL =
    "https://api.spotify.com/v1/me/player/recently-played?limit=5";

  fetch(callURL, {
    headers: {
      Authorization: "Bearer " + accessToken,
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      handleRecentlyPlayedData(data);
    })
    .catch((error) => {
      console.error("Error fetching playlist data", error);
    });
}

function handleRecentlyPlayedData(data) {
  const items = data.items;
  for (let i = 0; i < 5; i++) {
    const index = i + 1;
    const imageElement = document.querySelector("#songImg" + index);
    const songName = document.querySelector("#songName" + index);
    const songArtist = document.querySelector("#songArtist" + index);
    const songDuration = document.querySelector("#duration" + index);
    imageElement.setAttribute("src", items[i].track.album.images[0].url);
    songName.textContent = items[i].track.name;
    songArtist.textContent = items[i].track.artists[0].name;
    let durationMS = items[i].track.duration_ms;
    const durationDate = new Date(durationMS);
    let duration = durationDate.getMinutes() + ":";

    if (durationDate.getSeconds() < 10) {
      duration += "0" + durationDate.getSeconds();
    } else {
      duration += durationDate.getSeconds();
    }
    songDuration.textContent = duration;
  }
}

window.addEventListener("load", getPlaylists(), getRecentlyPlayed());
