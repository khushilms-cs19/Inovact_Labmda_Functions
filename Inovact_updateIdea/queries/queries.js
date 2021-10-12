const updateIdea_query = `
mutation updateIdea($id: Int_comparison_exp, $changes: idea_set_input) {
  update_idea(where: { id: $id }, _set: $changes) {
    returning {
      id
    }
  }
}
`;

module.exports = {
  updateIdea_query,
};
