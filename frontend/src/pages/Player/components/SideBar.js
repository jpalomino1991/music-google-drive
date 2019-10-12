import React from 'react';
import { Link, Route } from 'react-router-dom';
import { Flex, Text, Box } from 'rebass';

const CustomLink = ({ to, text, icon }) => (
  <Route
    to={to}
    render={props => {
      const match = props.location.pathname.indexOf(to) > -1;
      return (
        <Box
          css={`
            &:hover {
              background-color: #172036;
            }
            a {
              text-decoration: none;
              color: inherit;
            }
          `}
        >
          <Link to={to}>
            <Flex color={match ? 'primary' : 'gray'} py={3} px={4}>
              <Box mr={3}>
                <i className={`fas fa-${icon}`} />
              </Box>
              <Text fontWeight={match ? 'bold' : 'normal'} css={``}>
                {text}
              </Text>
            </Flex>
          </Link>
        </Box>
      );
    }}
  />
);

const SideBar = () => {
  return (
    <Flex flexDirection="column" flex="1" bg="black.0" width={1 / 4} py={4}>
      <CustomLink to="/player/folders" icon="folder" text="Folders" />
      <CustomLink to="/player/songs" icon="music" text="Songs" />
      <CustomLink to="/player/album" icon="music" text="Albums" />
      <CustomLink to="/player/artist" icon="users" text="Artists" />
    </Flex>
  );
};

export default SideBar;
