import { env } from 'process';

export const IsLocal = env.NODE_ENV === 'local';
