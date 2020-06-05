const { ApolloServer } = require("apollo-server");
const typeDefs = require("./schema");
const { createStore } = require("./utils");
const resolvers = require("./resolvers");

const LaunchAPI = require("./datasources/launch");
const UserAPI = require("./datasources/user");

const store = createStore();

const isEmail = require("isemail");

const server = new ApolloServer({
  // Function whose return value becomes the context argument passed to every resolver
  /**
   * Here's what the context function does:
   *  1.  Obtain the value for Authorization header (if any) included in the incoming request
   *  2.  Decode the value of the Authorization header
   *  3.  If the decoded value resembles an email address, obtain user detauls for
   *      that address and return an object that includes those details in the user field.
   */
  context: async ({ req }) => {
    // Simple auth check on every request
    const auth = (req.headers && req.headers.authorization) || "";
    const email = Buffer.from(auth, "base64").toString("ascii");
    if (!isEmail.validate(email)) return { user: null };
    // find user by email
    const users = await store.users.findOrCreate({ where: { email } });
    const user = (users && users[0]) || null;
    return { user: { ...user.dataValues } };
  },
  typeDefs,
  resolvers,
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store }),
  }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
