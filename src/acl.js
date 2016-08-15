import createDebug from 'debug';
import Boom from 'boom';
import NodeAclCb from 'acl';
import Promise from 'bluebird';

const debug = createDebug('acl');
const NodeAcl = Promise.promisifyAll(NodeAclCb);
const acl = new NodeAcl(new NodeAcl.memoryBackend());

// Departments permissions
acl.allow([
  {
    roles: ['系统部'],
    allows: [
      { resources: 'reports/it', permissions: ['read', 'write', 'delete'] },
      { resources: 'users', permissions: ['read', 'write', 'delete'] },
    ] },
  {
    roles: ['市场部'],
    allows: [
      { resources: 'reports/marketing', permissions: ['read', 'write', 'delete'] },
    ] },
  {
    roles: ['交易部'],
    allows: [
      { resources: 'reports/trading', permissions: ['read', 'write', 'delete'] },
    ] },
  {
    roles: ['财务部'],
    allows: [
      { resources: 'reports/finance', permissions: ['read', 'write', 'delete'] },
    ] },
  {
    roles: ['总经办'],
    allows: [
      { resources: 'reports/management', permissions: ['read', 'write', 'delete'] },
    ] },
  {
    roles: ['客户'],
    allows: [
      { resources: 'reports/customers', permissions: ['read'] },
    ] },
]);

// Users permissions
acl.allow([
  {
    roles: ['victor'],
    allows: [
      { resources: 'funds', permissions: ['read', 'write', 'delete'] },
      { resources: 'funds/:fundid', permissions: ['read', 'write', 'delete'] },
    ] },
]);


// roles       {String|Array} Role(s) to check the permissions for.
// permissions {String|Array} asked permissions.
// resource    {String} resource to ask permissions for.
async function can(roles, permissions, resource) {
  try {
    const isRoleAuthorized = await acl.areAnyRolesAllowed(roles, resource, permissions);
    return isRoleAuthorized;
  } catch (error) {
    debug('canRole() Error: %o', error);
  }
}

function canKoa(permissions, resource) {
  return async (ctx, next) => {
    const dpt = ctx.state.user.dpt;
    const userid = ctx.state.user.userid;
    const roles = dpt ? dpt.concat(userid) : [].concat(userid);
    debug(roles);
    const hasRight = await can(roles, permissions, resource);
    if (!hasRight) {
      const message = `Access forbidden. ${userid} is member of '${roles}'.\
 Not enough to '${permissions}' the '${resource}'.`;
      throw Boom.forbidden(message);
    }
    return next();
  };
}

export { can, canKoa };
