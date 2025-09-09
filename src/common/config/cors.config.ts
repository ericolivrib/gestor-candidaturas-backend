import { registerAs } from "@nestjs/config";

export interface CorsConfigProps {
  origin: string;
  methods: string;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
  allowedHeaders: string;
}

export default registerAs('cors', (): CorsConfigProps => ({
  origin: <string>process.env.CORS_ORIGIN,
  methods: <string>process.env.CORS_METHODS,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: <string>process.env.CORS_ALLOWED_HEADERS,
}));