const { gql } = require("apollo-server");

const typeDefs = gql`
  # Your schema will go here

  # Queries
  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean!
  }

  type Rocket {
    id: ID!
    name: String
    type: String
  }

  # [] means array
  # ! means can't be null
  # []! means can't be null, but CAN be empty
  type User {
    id: ID!
    email: String!
    trips: [Launch]!
  }

  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }

  enum PatchSize {
    SMALL
    LARGE
  }

  # me = currently logged in user
  type Query {
    # launches: [Launch]!
    # pageSize = The number of results to show.  Must be >= 1.  Default = 20
    # after = If you add a cursor it will only return results *after* this cursor
    launches(pageSize: Int, after: String): LaunchConnection!
    launch(id: ID!): Launch
    me: User
  }

  """
  (multi line comments!)
  Simple wrapper around our list of launches that contains a cursor to the last item in the
  list.  Pass this cursor to the launches query to fetch results after these.
  """
  type LaunchConnection {
    cursor: String!
    hasMore: Boolean!
    launches: [Launch]!
  }

  # Mutations
  type Mutation {
    bookTrips(launchIds: [ID]!): TripUpdateResponse!
    cancelTrip(launchId: ID!): TripUpdateResponse!
    login(email: String): String # login token
  }

  type TripUpdateResponse {
    success: Boolean!
    message: String
    launches: [Launch]
  }
`;

module.exports = typeDefs;
