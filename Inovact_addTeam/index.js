const { query: Hasura } = require('./utils/hasura');
const {
  addTeam,
  addInvitations,
  addRoles,
  addMembers,
} = require('./queries/mutations');
const { getUsersFromEmailId, getUserId } = require('./queries/queries');

const validateMembers = members => {
  for (const member of members) {
    if (typeof member.email != 'string' || typeof member.role != 'number') {
      return false;
    }
  }

  return true;
};

exports.handler = async (event, context, callback) => {
  const name =
    typeof event.name == 'string' && event.name.length != 0
      ? event.name
      : false;
  const avatar =
    typeof event.avatar == 'string' && event.avatar.length != 0
      ? event.avatar
      : '';
  const looking_for_mentor =
    typeof event.looking_for_mentor == 'boolean'
      ? event.looking_for_mentor
      : null;
  const looking_for_members =
    typeof event.looking_for_members == 'boolean'
      ? event.looking_for_members
      : null;
  const tags = event.tags instanceof Array ? event.tags : false;
  const members = event.members instanceof Array ? event.members : false;
  const roles = event.roles instanceof Array ? event.roles : false;

  if (
    name &&
    typeof looking_for_mentor == 'boolean' &&
    typeof looking_for_members == 'boolean' &&
    tags &&
    validateMembers(members) &&
    roles
  ) {
    // Save team to DB
    const teamData = {
      name,
      looking_for_members,
      looking_for_mentor,
      avatar,
    };

    const response1 = await Hasura(addTeam, teamData);

    if (!response1.success) callback(null, response1.errors);

    const team = response1.result.data.insert_team.returning[0];

    // Fetch user ids of existing users
    const emails = {
      emails: members.map(member => member.email),
    };

    const response2 = await Hasura(getUsersFromEmailId, emails);

    if (!response2.success) callback(null, response2.errors);

    // Extract users from response
    const { user: users } = response2.result.data;

    // Extract user ids from users
    let userIds = [];
    for (const user of users) {
      userIds.push(user.id);
    }

    // Emails of existing users
    const sentEmailIds = users.map(user => user.email_id);

    // Emails of non existing users
    const failedEmailds = members.filter(member => {
      if (sentEmailIds.indexOf(member.email) == -1) {
        return true;
      } else {
        return false;
      }
    });

    // Invite existing users to team
    let objects = [];

    for (const user of users) {
      objects.push({
        user_id: user.id,
        team_id: team.id,
      });
    }

    const invitations = {
      objects,
    };

    const response3 = await Hasura(addInvitations, invitations);

    if (!response3.success) return callback(null, response3.erorrs);

    // Save roles required for the team
    const roleObjects = {
      objects: roles.map(role => {
        return {
          role_id: role,
          team_id: team.id,
        };
      }),
    };

    const response4 = await Hasura(addRoles, roleObjects);

    if (!response4.success) return callback(null, response4.errors);

    // Add current user as a member with admin: true
    // Find user id
    const cognito_sub = event.cognito_sub;
    const response5 = await Hasura(getUserId, {
      cognito_sub: { _eq: cognito_sub },
    });

    if (!response5.success) return callback(null, response5.errors);

    const memberObjects = {
      objects: [
        {
          user_id: response5.result.data.user[0].id,
          team_id: team.id,
          admin: true,
        },
      ],
    };

    const response6 = await Hasura(addMembers, memberObjects);

    if (!response6.success) return callback(null, response6.errors);

    callback(null, { success: true });

    // @TODO Handle emails of non existing users
    // @TODO Send invites over mail using emails of existing users
    // @TODO What to do with Roles ?
    // @TODO Save team tags
  } else {
    callback('Bad Request: Invalid or missing required parameters');
  }
};
