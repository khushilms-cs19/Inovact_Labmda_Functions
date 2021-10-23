const { query: Hasura } = require('./utils/hasura');
const { checkTeamMember, checkIfAdmin } = require('./queries/queries.js');
const { addTeamInvite } = require('./queries/mutations');

exports.handler = async (events, context, callback) => {
  const team_id = events.team_id;
  const user_id = events.user_id;
  const cognito_sub = events.cognito_sub;

  const response1 = await Hasura(checkIfAdmin, { cognito_sub, team_id });

  if (!response1.success) return callback(null, response1.errors);

  if (!response1.result.data.team_members[0].admin)
    return callback({ message: 'Only admins can invite users to the team' });

  const response2 = await Hasura(checkTeamMember, { team_id, user_id });

  if (!response2.success) return callback(null, response2.errors);

  if (response2.result.data.team_members.length)
    return callback({
      message: 'User already a member of the team',
    });

  const response3 = await Hasura(addTeamInvite, { team_id, user_id });

  if (!response3.success) return callback(null, response3.errors);

  callback(null, response3.result);
};