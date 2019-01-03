const tasks = require('../tasks');

const Mutation = {
  async createFolder(
    parent,
    args,
    {
      db,
      request: { userId }
    },
    info
  ) {
    if (!userId) throw new Error('You must be signin.');

    const folderExists = await db.exists.MusicFolder({
      user: {
        id: userId
      },
      folderId: args.folderId
    });
    if (folderExists) throw new Error('Folder already linked');

    const newFolder = await db.mutation.createMusicFolder(
      {
        data: {
          states: {
            create: [
              {
                status: 'STARTING'
              }
            ]
          },
          user: {
            connect: {
              id: userId
            }
          },
          ...args
        }
      },
      info
    );
    await tasks({
      folderDriveId: args.folderId,
      folderId: newFolder.id,
      refreshToken: (await db.query.user({
        where: {
          id: userId
        }
      })).refreshToken
    });
    return newFolder;
  }
};

module.exports = Mutation;
