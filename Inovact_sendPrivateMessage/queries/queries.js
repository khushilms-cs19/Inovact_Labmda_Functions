const getConnectionDetails = `query getConnectionDetails($user_id: Int, $cognito_sub: String) {
  connections_aggregate(where: {_or: [{_and: [{user: {cognito_sub: {_eq: $cognito_sub}}}, {user2: {_eq: $user_id}}]}, {_and: [{userByUser2: {cognito_sub: {_eq: $cognito_sub}}}, {user1: {_eq: $user_id}}]}], status: {_eq: "connected"}}) {
    aggregate {
      count
    }
  }
}`;

const getUserId = `query getUser($cognito_sub: String_comparison_exp) {
  user(where: { cognito_sub: $cognito_sub }) {
    id
  }
}
`;

module.exports = {
  getConnectionDetails,
  getUserId,
};
