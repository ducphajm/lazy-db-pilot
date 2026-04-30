export type LoadDatabases = (url: string) => Promise<string[]>;

export type LoadCollections = (
  url: string,
  databaseName: string,
) => Promise<string[]>;
