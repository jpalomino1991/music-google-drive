const Query = {
  me(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  folder(
    parent,
    args,
    {
      db,
      request: { userId }
    },
    info
  ) {
    if (!userId) throw new Error('You must be signin.');
    return db.query.musicFolders(
      {
        first: 1,
        where: {
          user: {
            id: userId
          }
        }
      },
      info
    );
  }
};

module.exports = Query;
