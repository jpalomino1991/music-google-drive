import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Link, withRouter } from 'react-router-dom';
import { Flex, Box, Text } from 'rebass';

const FETCH_ITEM = gql`
  query FETCH_ITEM($id: String) {
    item(id: $id) {
      title
      id
      parentId
    }
  }
`;

const generateNestedPath = (path, id) => path.replace('/:id', '') + '/' + id;

const ParentFolder = ({ id, match }) => {
  return (
    <Query query={FETCH_ITEM} variables={{ id }}>
      {({ loading, data }) => {
        if (loading) return <div>loading</div>;
        if (!data || !data.item) return <div />;
        return (
          <Link
            to={generateNestedPath(match.path, data.item.parentId)}
            css={`
              text-decoration: none;
            `}
          >
            <Flex p={2} color="primary" fontSize={3}>
              <Box mr={3}>
                <i className="fas fa-chevron-left" />
              </Box>
              <Text fontWeight="bold">{data.item.title}</Text>
            </Flex>
          </Link>
        );
      }}
    </Query>
  );
};

export default withRouter(ParentFolder);
