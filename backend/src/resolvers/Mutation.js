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
    return db.mutation.createMusicFolder(
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
  }
};

module.exports = Mutation;
