const mongoose = require('mongoose');
const chalk = require('chalk');

const dbConfig = require('../../config/database');

/**
 * Establishes the MongoDB connection using Mongoose.
 * Reads the correct URI env variable based on NODE_ENV,
 * mirroring the old Sequelize config.json dialect pattern.
 *
 * @param {object} server - The HTTP server instance (kept for API compatibility)
 * @param {object} app    - The Express app instance (kept for API compatibility)
 */
module.exports = async (server, app) => {
  const env = process.env.NODE_ENV || 'development';
  const config = dbConfig[env] || dbConfig.development;
  const mongoUri = process.env[config.use_env_variable];

  if (!mongoUri) {
    console.error(
      '%s MongoDB URI is not defined. Set the %s environment variable.',
      chalk.red('✗'),
      config.use_env_variable
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(
      '%s MongoDB connection established successfully. [%s → %s]',
      chalk.green('✓'),
      env,
      config.use_env_variable
    );
  } catch (err) {
    console.error('%s Unable to connect to MongoDB:', chalk.red('✗'), err);
    process.exit(1);
  }
};
