import logger from 'sw-common';
import Boom from 'boom';
import crud from 'sw-mongodb-crud';

// const logger.debug = createDebug('app:api:acls');
// const logger.error = createDebug('app:api:acls:error');
// logger.error.log = console.error.bind(console);

export async function getACLs() {
  try {
    const acls = await crud.acl.getList({}, { _id: 0 });
    logger.debug('acls', acls);

    if (!acls) throw Boom.notFound('ACLs not found');

    return { ok: true, acls };
  } catch (error) {
    logger.error('getACLs(): %j', error);
    throw error;
  }
}
