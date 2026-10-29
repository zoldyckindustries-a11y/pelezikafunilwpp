import { createClient, RedisClientType } from 'redis';

const REDIS_URL = "redis://default:pB6m0QTjKm6OCeVDTG4F5SwJ2lRXlDmZ@redis-12146.c246.us-east-1-4.ec2.redns.redis-cloud.com:12146";

let redisClient: RedisClientType | null = null;

async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL });

    redisClient.on('error', (err) => console.error('Redis error:', err));

    try {
      await redisClient.connect();
      console.log('[Redis] Connected');
    } catch (err) {
      console.error('[Redis] Connection failed:', err);
      throw err;
    }
  }

  // Verifica se a conexão foi fechada ou falhou, tenta reconectar
  if (redisClient.isOpen === false) {
    console.log('[Redis] Reconnecting...');
    await redisClient.connect();
  }

  return redisClient;
}

export default getRedisClient;
