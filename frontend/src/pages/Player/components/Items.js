import React from "react";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";

import Folder from "./Folder";
import Song from "./Song";

const FETCH_ITEMS = gql`
  query FETCH_ITEMS($id: String) {
    items(parentId: $id) {
      id
      type
      providerId
      title
      parentId
      link
    }
  }
`;

const UPDATE_SONG_QUEUE = gql`
  mutation updateSongQueue($songQueue: [Song], $currentIndexSong: Int) {
    updateSongQueue(songQueue: $songQueue, currentIndexSong: $currentIndexSong)
      @client
  }
`;

const Items = ({ id }) => {
  return (
    <Mutation mutation={UPDATE_SONG_QUEUE}>
      {updateSongQueue => (
        <Query query={FETCH_ITEMS} variables={{ id }}>
          {({ loading, data }) => {
            if (loading) return <div>loading</div>;
            return (
              <div>
                {data.items.map((item, i) => (
                  <div key={item.id}>
                    {item.type === "folders" ? (
                      <Folder {...item} />
                    ) : (
                      <Song
                        onClick={() =>
                          updateSongQueue({
                            variables: {
                              songQueue: data.items.filter(
                                item => item.type !== "folders"
                              ),
                              currentIndexSong: i
                            }
                          })
                        }
                        {...item}
                      />
                    )}
                  </div>
                ))}
              </div>
            );
          }}
        </Query>
      )}
    </Mutation>
  );
};

export default Items;
