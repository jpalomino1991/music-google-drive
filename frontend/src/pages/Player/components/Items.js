import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import { useMusicQueue } from "../../../hooks/musicQueueContext";
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

const byTitle = (a, b) => (a.title > b.title ? 1 : -1);

const Items = ({ id }) => {
  const { setSongQueue } = useMusicQueue();

  return (
    <Query query={FETCH_ITEMS} variables={{ id }}>
      {({ loading, data }) => {
        if (loading) return <div>loading</div>;
        return (
          <div>
            {data.items.sort(byTitle).map((item, i) => (
              <div key={item.id}>
                {item.type === "folders" ? (
                  <Folder {...item} />
                ) : (
                  <Song
                    onClick={() =>
                      setSongQueue(
                        data.items.filter(item => item.type !== "folders")
                      )
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
  );
};

export default Items;
