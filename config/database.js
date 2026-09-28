/**
 * MongoDB connection configuration per environment.
 * Each entry has a `use_env_variable` key that points to the environment
 * variable holding the MongoDB connection URI — mirrors the old Sequelize
 * config.json pattern so switching envs only requires setting NODE_ENV.
 */
const dbConfig = {
  local: {
    use_env_variable: 'LOCAL_MONGODB_URI',
  },
  development: {
    use_env_variable: 'DEV_MONGODB_URI',
  },
  test: {
    use_env_variable: 'TEST_MONGODB_URI',
  },
  production: {
    use_env_variable: 'MONGODB_URI',
  },
};

module.exports = dbConfig;
