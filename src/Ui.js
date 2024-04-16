import "./Ui.css";
import React, { useState, useEffect } from "react";
import * as oauth from "./Oauth";
import * as api from "./SpotifyApi";
import Playlist from "./Playlist";
import SearchResult from "./SearchResult";

const JammmingUi = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [profile, setProfile] = useState({});
  const [playlists, setPlaylists] = useState([]);
  const [playlist, setPlaylist] = useState({});
  const [editList, setEditList] = useState([]);
  const [addToList, setAddToList] = useState([]);
  const [deleteFromList, setDeleteFromList] = useState([]);
  const [searchResult, setSearchResult] = useState({});
  const [loader, setLoader] = useState(false);
  const [modified, setModified] = useState(false);
  const [playlistNewName, setPlaylistNewName] = useState("");

  const loginWithSpotify = () => {
    setProfile({});
    setAccessToken(null);
    clearStorage();
    oauth.requestUserAuthorization();
  };

  const logOut = () => {
    setProfile({});
    setAccessToken(null);
    setPlaylists([]);
    setPlaylist({});
    clearStorage();
    window.location = "./";
  };

  const searchSpotifyClick = () => {
    const term = document.getElementById("search_term").value;
    if (term) {
      //console.log("search spotify button clicked");
      setLoader(true);
      api
        .search(term, accessToken, loginWithSpotify)
        .then((response) => {
          //console.log(response);
          setSearchResult(response);
          setLoader(false);
        })
        .catch((error) => {
          console.log(error);
          setLoader(false);
        });
    } else {
    }
  };

  const pullEditList = (list) => {
    if (list.tracks) {
      const items = list.tracks.items;
      const newArr = items.map((item) => {
        return {
          id: item.track.id,
          imgSrc: item.track.album.images[2].url,
          albumName: item.track.album.name,
          trackName: item.track.name,
          artistName: item.track.artists[0].name,
          uri: item.track.uri,
        };
      });
      return newArr;
    }

    return [];
  };

  const loadPlayList = () => {
    if (document.getElementById("playlists_select").value) {
      const id = document.getElementById("playlists_select").value;
      //console.log("Load playlist ID ", id);
      setLoader(true);
      api
        .getPlaylist(id, accessToken, loginWithSpotify)
        .then((response) => {
          setModified(false);
          setEditList(pullEditList(response));
          setPlaylist({ id: response.id, name: response.name });
          setPlaylistNewName(response.name);
          setLoader(false);
        })
        .catch((error) => {
          console.log(error);
          setLoader(false);
        });
    }
  };

  const unloadPlaylist = () => {
    setPlaylist({});
    setEditList([]);
    setModified(false);
    setPlaylistNewName("");
  };

  const handleNewListClick = () => {
    unloadPlaylist();
    newListFormToggle();
    setModified(false);
  };

  const newListFormToggle = () => {
    const container = document.getElementById("createListForm");
    container.classList.contains("hide")
      ? container.classList.remove("hide")
      : container.classList.add("hide");
  };

  const createList = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    //console.log(!data.get("newPlaylistPublic"));
    const props = {
      name: data.get("newPlaylistName"),
      description: data.get("newPlaylistDescdiption"),
    };

    const isPublic = data.get("newPlaylistPublic");
    if (!isPublic || isPublic === "false") {
      props.public = false;
    }

    api
      .addPlaylist(props, profile.id, accessToken, loginWithSpotify)
      .then((response) => {
        setPlaylists([]);
        newListFormToggle();
        document.getElementById("newPlaylistForm").reset();
      });
  };

  const deleteTrack = (id, uri) => {
    const duplicate = deleteFromList.find(function (element) {
      return element.id === id;
    });
    if (!duplicate) {
      setDeleteFromList([...deleteFromList, { id: id, uri: uri }]);
    }
    setEditList(editList.filter((item) => item.id !== id));
    setAddToList(addToList.filter((item) => item.id !== id));
    setModified(true);
  };

  const addTrack = (listItem) => {
    //console.log("list items: ", listItem);
    if (!playlist.id) {
      alert("Unable to add track: Playlist not loaded.");
      return;
    }
    let id = listItem.id;
    let uri = listItem.uri;
    const duplicate = editList.find(function (element) {
      return element.id === id;
    });
    setDeleteFromList(deleteFromList.filter((item) => item.id !== id));
    if (!duplicate) {
      const track = { id: id, uri: uri };
      setAddToList([track, ...addToList]);
      setEditList([listItem, ...editList]);
      setModified(true);
    } else {
      alert("Track already on Playlist");
    }
  };

  const clearStorage = () => {
    const items = ["access_token", "code_verifier", "codeChallenge", "profile"];
    items.forEach((item) => {
      if (window.localStorage.getItem(item)) {
        window.localStorage.removeItem(item);
      }
    });
  };

  const clearSearch = () => {
    setSearchResult({});
    document.getElementById("search_term").value = "";
  };

  const changePlaylistName = (event) => {
    setPlaylistNewName(event.target.value);
    setPlaylist({ name: event.target.value, ...playlist });
    setModified(true);
  };

  const saveChanges = () => {
    const playlist_id = document.getElementById("playlists_select").value;
    const rename = playlist.name !== playlistNewName;
    api
      .saveListChanges(
        playlist_id,
        deleteFromList,
        addToList,
        playlist.name,
        playlistNewName,
        accessToken,
        loginWithSpotify
      )
      .then((response) => {
        //console.log(response);
        setAddToList([]);
        setDeleteFromList([]);
        alert("Playlist changes saved!");
        if (rename) {
          alert(
            "Changes saved. NOTE: It may take a minute or two for the playlist name change to be complete in Spotify"
          );
          window.location = './';
        }
      });
  };

  const PlaylistsItems = ({ playlists }) => {
    if (playlists) {
      const elements = playlists.map((list) => {
        return (
          <option key={list.id} value={list.id}>
            {list.name}
          </option>
        );
      });
      return (
        <select
          id="playlists_select"
          value={playlist.id ? playlist.id : ""}
          onChange={loadPlayList}
        >
          <option value="">Select playlist to edit</option>
          {elements}
        </select>
      );
    }
  };

  useEffect(() => {
    if (!accessToken && window.localStorage.getItem("access_token")) {
      setAccessToken(window.localStorage.getItem("access_token"));
    }

    if (!profile && window.localStorage.getItem("profile")) {
      setProfile(JSON.parse(window.localStorage.getItem("profile")));
    }

    const code =
      new URLSearchParams(window.location.search).get("code") || false;
    if (code) {
      //console.log("detected code param, calling getToken()");
      oauth.getToken(code);
    }

    if (accessToken && !profile.id) {
      setLoader(true);
      api.getProfile(accessToken, loginWithSpotify).then((data) => {
        setProfile(data);
        setLoader(false);
      });
    }

    if (!playlists.length && profile.id) {
      setLoader(true);

      api.getPlaylists(accessToken, loginWithSpotify).then((response) => {
        setPlaylists(response);
        setLoader(false);
      });
    }
  }, [accessToken, profile, playlists, playlist, loginWithSpotify]);

  return (
    <div className="jammmingUI">
      <div className={loader ? "loader" : "hide"}></div>

      <section id="login_screen" className={accessToken ? "hide" : ""}>
        <button id="login-button" onClick={loginWithSpotify}>
          Log in with Spotify
        </button>
      </section>

      <section
        id="profile"
        className={accessToken ? "profile" : "profile hide"}
      >
        <img
          className={profile.images ? "profileImage" : "hide"}
          src={profile.images ? profile.images[0].url : ""}
          alt="user pic"
        />

        <button className="logout-button" onClick={logOut}>
          Log Out
        </button>
      </section>

      <section
        id="lists"
        className={profile.display_name ? "lists-container" : "hide"}
      >
        <div id="search_result" className="list">
          <h3>Search Spotify</h3>
          <input
            type="text"
            id="search_term"
            placeholder="track, artist, or album name"
          />
          <div className="button-group">
            <button onClick={searchSpotifyClick}>Search Spotify</button>
            <button className="clear-search" onClick={clearSearch}>
              Clear Search
            </button>
          </div>
          <SearchResult
            searchResult={searchResult}
            addTrack={addTrack}
            editList={editList}
          />
        </div>
        <div id="playlist" className="list">
          <h3>Playlists</h3>
          <PlaylistsItems playlists={playlists} />
          <div className="button-group">
            <button
              className={modified ? "save-changes" : "hide"}
              onClick={saveChanges}
            >
              Save Changes
            </button>
            <button
              type="button"
              className="playlist-new"
              onClick={handleNewListClick}
            >
              New Playlist
            </button>
          </div>

          <div id="createListForm" className="hide">
            <h4>New Playlist</h4>
            <form id="newPlaylistForm" onSubmit={createList}>
              <input name="newPlaylistName" placeholder="Name" required />

              <input
                name="newPlaylistDescription"
                placeholder="Description"
                required
              />
              <div className="radioGroup">
                <span>
                  <input type="radio" name="newPlaylistPublic" value="true" />
                  Public
                </span>
                <br />
                <span>
                  <input type="radio" name="newPlaylistPublic" value="false" />
                  Private
                </span>
              </div>
              <button type="submit">Create Playlist</button>
            </form>
          </div>

          <div className={playlist.id ? "" : "hide"}>
            <Playlist
              name={playlist.name ? playlist.name : ""}
              playlistNewName={playlistNewName}
              changePlaylistName={changePlaylistName}
              list={editList}
              playlistId={playlist.id ? playlist.id : ""}
              deleteTrack={deleteTrack}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default JammmingUi;
