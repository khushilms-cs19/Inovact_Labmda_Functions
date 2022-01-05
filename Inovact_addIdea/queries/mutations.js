const addIdea = `mutation add_idea($description: String!, $title:String!, $user_id:Int, $team_id: Int) {
  insert_idea(objects: [{
    description: $description,
    user_id: $user_id,
		title:$title,
    team_id: $team_id
  }]) {
    returning {
      id,
      title,
      description,
      user_id,
      created_at
      updated_at
      team_id
      user {
        id
        avatar
        first_name
        last_name
        role
      }
    }
  }
}`;

const addTags = `mutation addIdea($objects: [idea_tag_insert_input!]!) {
  insert_idea_tag(objects: $objects) {
    returning {
      idea_id
      tag_id
    }
  }
}`;

const addTeam = `mutation addTeam($name: String, $looking_for_members: Boolean, $looking_for_mentors: Boolean, $avatar: String) {
  insert_team(objects: [{
    name: $name,
    looking_for_members: $looking_for_members,
    looking_for_mentors: $looking_for_mentors,
    avatar: $avatar
  }]) {
    returning {
      id
    }
  }
}
`;

const addMembers = `mutation addMembers($objects: [team_members_insert_input!]!) {
  insert_team_members(objects: $objects) {
    returning {
      user_id
      team_id
      admin
      joined_date
    }
  }
}`;

module.exports = {
  addIdea,
  addTags,
  addTeam,
  addMembers,
};
