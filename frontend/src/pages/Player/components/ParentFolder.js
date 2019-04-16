import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { Link } from "react-router-dom";

const FETCH_ITEM = gql`
  query FETCH_ITEM($id: String) {
    item(id: $id) {
      title
      id
      parentId
    }
  }
`;

const ParentFolder = ({ id }) => {
  return (
    <Query query={FETCH_ITEM} variables={{ id }}>
      {({ loading, data }) => {
        if (loading) return <div>loading</div>;
        if (!data || !data.item) return <div />;
        return (
          <Link to={`/player/${data.item.parentId}`}>
            {`<`} {data.item.title}
          </Link>
        );
      }}
    </Query>
  );
};

export default ParentFolder;
