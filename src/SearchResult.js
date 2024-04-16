import React from "react";

const SearchResult = ({ searchResult, addTrack, editList }) => {
  let total = 0;

  if (searchResult.tracks) {
    //console.log("searchResult.tracks: ", searchResult.tracks.items);
    total = searchResult.tracks.total;
    if (total) {
      const elements = searchResult.tracks.items.map((item, index) => {
        return (
          <li key={index} value={item.id}>
            <img src={item.album.images[2].url} alt={item.album.name} />
            <span>
              {item.name}
              <br />
              <i>{item.artists[0].name}</i>
            </span>

            <span
              className="add-icon"
              aria-label={"Click to add " + item.name}
              onClick={() =>
                addTrack({
                  id: item.id,
                  uri: item.uri,
                  imgSrc: item.album.images[2].url,
                  albumName: item.album.name,
                  trackName: item.name,
                  artistName: item.artists[0].name,
                })
              }
            >
              &#x2B;
            </span>
          </li>
        );
      });

      return (
        <>
          <div className="search-results-list">Search Results</div>
          <ul className="list-unit searchResults" key="search_result_list">
            {elements}
          </ul>
        </>
      );
    }
  }
};

export default SearchResult;
