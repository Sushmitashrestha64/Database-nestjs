import 'reflect-metadata';
import { config as dotenvConfig } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import databaseConfig from './config/database.config';

dotenvConfig();

const config = databaseConfig();
console.log('Database Config:', config);
const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  database: config.database,
  entities: [User],
  migrations: ['src/migrations/*.ts'], 
  synchronize: false,
});

export default AppDataSource;
