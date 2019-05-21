const elastic = require('../tasks/elastic');

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
  folders(
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
        where: {
          user: {
            id: userId
          }
        }
      },
      info
    );
  },
  item(
    parent,
    args,
    {
      request: { providerId, userId }
    },
    info
  ) {
    if (!userId) throw new Error('You must be signin.');
    return elastic.getItem(args.id, providerId);
  },
  items(
    parent,
    args,
    {
      request: { userId, providerId }
    },
    info
  ) {
    if (!userId) throw new Error('You must be signin.');
    return elastic.getChildren(args.parentId, providerId);
  }
};

module.exports = Query;
