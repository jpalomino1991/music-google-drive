const tasks = require('../tasks');

setTimeout(tasks, 1000);

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
    tasks({
      folderId,
      folderDriveId
    });
    return newFolder;
  }
};

module.exports = Mutation;
