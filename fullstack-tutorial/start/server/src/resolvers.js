const { paginateResults } = require("./utils");

module.exports = {
  Query: {
    // launches: (_, __, { dataSources }) => dataSources.launchAPI.getAllLaunches(),
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
      const allLaunches = await dataSources.launchAPI.getAllLaunches();
      // we want the results in reverse chronologial order
      allLaunches.reverse();
      const launches = paginateResults({
        after,
        pageSize,
        results: allLaunches,
      });
      return {
        launches,
        cursor: launches.length ? launches[launches.length - 1].cursor : null,
        // if the cursor at the end of the paginated results is the same as the
        // last item in *all* results, then there are no more results!
        hasMore: launches.length
          ? launches[launches.length - 1].cursor !==
            allLaunches[allLaunches.length - 1].cursor
          : false,
      };
    },
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: async (_, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser(),
  },
  Mutation: {
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser({ email });
      if (user) return Buffer.from(email).toString("base64");
    },
    bookTrips: async (_, { launchIds }, { dataSources }) => {
      const results = await dataSources.userAPI.bookTrips({ launchIds });
      const launches = await dataSources.launchAPI.getLaunchByIds({
        launchIds,
      });

      return {
        success: results && results.length === launchIds.length,
        message:
          results.length === launchIds.length
            ? `Trips booked successfully!`
            : `The following launches couldn't be booked: ${launchIds.filter(
                (id) => !results.includes(id)
              )}`,
        launches,
      };
    },
    cancelTrip: async (_, { launchId }, { dataSources }) => {
      const result = await dataSources.userAPI.cancelTrip({ launchId });
      return {
        success: false,
        message: "failed to cancel trip",
      };

      const launch = await dataSources.launchAPI.getLaunchById({ launchId });
      return {
        success: true,
        message: "trip cancelled",
        launches: [launch],
      };
    },
  },
  Mission: {
    // The default is 'LARGE' if not provided
    missionPatch: (mission, { size } = { size: "LARGE" }) => {
      return size === "SMALL"
        ? mission.missionPatchSmall
        : mission.missionPatchLarge;
    },
  },
  Launch: {
    isBooked: async (launch, _, { dataSources }) =>
      dataSources.userAPI.isBookedOnLaunch({ launchId: launch.id }),
  },
  User: {
    trips: async (_, __, { dataSources }) => {
      // get ids of launches by user
      const launchIds = await dataSources.userAPI.getLaunchIdsByUser();
      if (!launchIds.length) return [];
      // look up those launches by their ids
      return (
        dataSources.launchAPI.getLaunchesByIds({
          launches,
        }) || []
      );
    },
  },
};

/**
 * Resolver signature:
 * field: (parent, args, context, info) => data
 *
 * In the above example:
 * _ is passed to the first positional argument is a convention to indicate they don't use its value
 * __ is passed to the second positional argument for the same reason (note that 'launch' does indeed use it)
 * All three resolver functions do use the third argument, context.  They destructure it to dataSources.
 * None of the resolveer functions use the fourth argument to info so it's ommitted.
 */
