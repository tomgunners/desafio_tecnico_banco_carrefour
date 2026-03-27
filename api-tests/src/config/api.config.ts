import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const apiConfig = {
  baseUrl: process.env.API_BASE_URL ?? 'https://dummyjson.com',
  timeout: Number(process.env.REQUEST_TIMEOUT ?? 10000)
} as const;
