export enum DatabaseType {
  MongoDB = 'mongodb',
  Redis = 'redis',
  SQLite = 'sqlite',
}

export enum ConnectionEnvironment {
  Local = 'local',
  Development = 'development',
  Production = 'production',
}

export type MongoConnectionDetails = {
  readonly url: string;
};

export type EmptyConnectionDetails = Record<string, never>;

type BaseConnection = {
  readonly name: string;
  readonly environment: ConnectionEnvironment;
};

export type MongoConnection = BaseConnection & {
  readonly type: DatabaseType.MongoDB;
  readonly details: MongoConnectionDetails;
};

export type RedisConnection = BaseConnection & {
  readonly type: DatabaseType.Redis;
  readonly details: EmptyConnectionDetails;
};

export type SQLiteConnection = BaseConnection & {
  readonly type: DatabaseType.SQLite;
  readonly details: EmptyConnectionDetails;
};

export type DatabaseConnection =
  | MongoConnection
  | RedisConnection
  | SQLiteConnection;

export type ConnectionInput = {
  readonly name: string;
  readonly type: DatabaseType;
  readonly environment: ConnectionEnvironment;
  readonly details: unknown;
};
