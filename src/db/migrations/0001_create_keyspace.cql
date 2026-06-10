CREATE KEYSPACE IF NOT EXISTS llink
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 3
};