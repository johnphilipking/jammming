import React, { useState, useEffect } from "react";

const getHeaders = (token) => {
  const authCode = "Bearer " + token;
  const headers = { Authorization: authCode };
  return headers;
};

export async function getProfile(token, loginExpired) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (response.ok) {
    try {
      const data = await response.json();
      window.localStorage.setItem("profile", JSON.stringify(data));
      return data;
    } catch (error) {
      if (error.message && error.message.includes("The access token expired")) {
        loginExpired();
      }
      console.log(error);
    }
  } else {
    const data = await response.json();
    if (
      data.error.message &&
      data.error.message === "The access token expired"
    ) {
      loginExpired();
    }
  }
}

export async function getPlaylists(token, loginExpired) {
  const response = await fetch(
    "https://api.spotify.com/v1/me/playlists?offset=0&limit=50",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  if (response.ok) {
    try {
      const data = await response.json();
      //console.log(data.items);
      return data.items;
    } catch (error) {
      if (error.message && error.message === "The access token expired") {
        loginExpired();
      }
      console.log(error);
    }
  } else {
    const data = await response.json();
    if (
      data.error.message &&
      data.error.message === "The access token expired"
    ) {
      loginExpired();
    }
  }
}

export async function getPlaylist(id, token, loginExpired) {
  const response = await fetch(
    "https://api.spotify.com/v1/playlists/" + id + "?offset=0&limit=50",
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );
  if (response.ok) {
    try {
      const data = await response.json();
      //console.log(data);
      return data;
    } catch (error) {
      if (error.message && error.message === "The access token expired") {
        loginExpired();
      }
      console.log(error);
    }
  } else {
    const data = await response.json();
    if (
      data.error.message &&
      data.error.message === "The access token expired"
    ) {
      loginExpired();
    }
  }
}

export async function addPlaylist(listProps, user_id, token, loginExpired) {
  const endpoint = "https://api.spotify.com/v1/users/" + user_id + "/playlists";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listProps),
  });

  if (response.ok) {
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.message && error.message === "The access token expired") {
        loginExpired();
      }
      console.log(error);
    }
  } else {
    const data = await response.json();
    if (
      data.error.message &&
      data.error.message === "The access token expired"
    ) {
      loginExpired();
    }
    console.log(data);
  }
}

export async function saveListChanges(
  playlist_id,
  deleteItems,
  addItems,
  token,
  loginExpired
) {
  const saveStatus = {
    addComplete: false,
    deleteComplete: false,
    addError: "",
    deleteError: "",
  };

  const saveComplete = () => {
    if (saveStatus.addComplete && saveStatus.deleteComplete) {
      return JSON.stringify(saveStatus);
    }
  };

  if (addItems.length) {
    saveOrDeleteTracks("POST", playlist_id, addItems, token, loginExpired).then(
      (response) => {
        saveStatus.addComplete = true;
        saveComplete();
      }
    );
  } else {
    saveStatus.addComplete = true;
    saveComplete();
  }

  if (deleteItems.length) {
    saveOrDeleteTracks(
      "DELETE",
      playlist_id,
      deleteItems,
      token,
      loginExpired
    ).then((response) => {
      saveStatus.deleteComplete = true;
      saveComplete();
    });
  } else {
    saveStatus.deleteComplete = true;
    saveComplete();
  }
}

async function saveOrDeleteTracks(
  method,
  playlist_id,
  tracks,
  token,
  loginExpired
) {
  const apiEndpoint =
    "https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks";

  const trackArray = [];
  for (let item of tracks) {
    trackArray.push(item.uri);
  }

  const payload = {
    uris: trackArray,
  };

  if (method === "POST") {
    payload.position = 0;
  }

  const response = await fetch(apiEndpoint, {
    method: method,
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.message && error.message === "The access token expired") {
        loginExpired();
      }
      console.log(error);
    }
  } else {
    const data = await response.json();
    if (
      data.error.message &&
      data.error.message === "The access token expired"
    ) {
      loginExpired();
    }
    console.log(data);
  }
}

export async function search(query, token, loginExpired) {
  const endpoint =
    "https://api.spotify.com/v1/search?q=" +
    encodeURIComponent(query) +
    "&type=track&limit=50&offset=0";

  const response = await fetch(endpoint, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (response.ok) {
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.message && error.message === "The access token expired") {
        loginExpired();
      }
      console.log(error);
    }
  } else {
    const data = await response.json();
    if (
      data.error.message &&
      data.error.message === "The access token expired"
    ) {
      loginExpired();
    }
    //console.log(data);
  }
}
