const { query: Hasura } = require('./utils/hasura');
const {
  getUserId,
  getPendingConnection,
  deleteConnection,
} = require('./queries/queries');

exports.handler = async (events, context, callback) => {
  const user_id = events.user_id;

  // Find user id
  const cognito_sub = events.cognito_sub;
  const response1 = await Hasura(getUserId, {
    cognito_sub: { _eq: cognito_sub },
  });

  if (!response1.success) return callback(null, response1.errors);

  // Fetch connection
  const variables = {
    user2: response1.result.data.user[0].id,
    user1: user_id,
  };

  const response2 = await Hasura(getPendingConnection, variables);

  if (!response2.success) callback(null, response2.errors);

  const response3 = await Hasura(deleteConnection, variables);

  if (!response3.success) callback(null, response3.errors);

  callback(null);
};