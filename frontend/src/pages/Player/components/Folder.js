import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Flex, Box, Text } from 'rebass';

const generateNestedPath = (path, id) => path.replace('/:id', '') + '/' + id;

const Folder = ({ id, title, match }) => {
  return (
    <Link
      to={generateNestedPath(match.path, id)}
      css={`
        text-decoration: none;
      `}
    >
      <Flex
        color="text"
        p={2}
        alignItems="center"
        css={`
          border-radius: 5px;
          &: hover {
            background-color: #443355;
          }
        `}
      >
        <Box mr={3}>
          <i className="fas fa-folder" />
        </Box>
        <Text fontWeight="bold">{title}</Text>
      </Flex>
    </Link>
  );
};

export default withRouter(Folder);
