import { registerAs } from '@nestjs/config';

export interface ServerConfigProps {
  port: number;
  host: string;
}

export default registerAs(
  'server',
  (): ServerConfigProps => ({
    port: Number(process.env.SERVER_PORT),
    host: process.env.SERVER_HOST as string,
  }),
);
