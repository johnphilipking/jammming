import React from "react";

const Playlist = ({ name, list, playlistId, deleteTrack }) => {
  //console.log(list);

  const elements = list.map((item, index) => {
    return (
      <li key={index} value={item.id}>
        <img src={item.imgSrc} alt={item.albumName} />
        <span>
          {item.trackName}
          <br />
          <i>{item.artistName}</i>
        </span>
        <span
          className="delete-icon"
          onClick={() => deleteTrack(item.id, item.uri)}
          aria-label={"Click to delete " + item.trackName}
        >
          &#10005;
        </span>
      </li>
    );
  });

  return (
    <>
      <div className="edit-list-name">Playlist: {name}</div>
      <ul className="list-unit playlist" key="playlist_ul">
        {elements}
      </ul>
    </>
  );
};

export default Playlist;
