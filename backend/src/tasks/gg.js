const { fork } = require('child_process');

const db = require('../db');

module.exports = async ({ refreshToken, folderDriveId, folderId, counts }) => {
  const newState = await db.mutation.createState({
    data: {
      status: 'DOWNLOADING',
      extraData: counts,
      folder: {
        connect: {
          id: folderId
        }
      }
    }
  });

  try {
    console.log('to fork');
    const forked = fork('src/tasks/processMetadata.js');
    forked.on('message', msg => {
      console.log('finished', msg);
      setTimeout(() => {
        console.log('kill');
        forked.kill();
      }, 2000);
    });
    forked.send({
      type: 'START',
      payload: {
        refreshToken,
        folderDriveId,
        folderId,
        counts,
        newStateId: newState.id,
        start: 0,
        end: 3000
      }
    });
  } catch (e) {
    console.log('e', e);
  }
};
