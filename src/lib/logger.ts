import winston from "winston";

// Configuración del logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      if (stack) {
        return `[${timestamp}] ${level}: ${message}\n${stack}`;
      }
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      handleExceptions: true,
    }),
    // File transport para logs de error
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      handleExceptions: true,
    }),
    // File transport para todos los logs
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
  exitOnError: false,
});

// Si estamos en producción, no logueamos a la consola
if (process.env.NODE_ENV === "production") {
  logger.remove(logger.transports[0]); // Remueve console transport
}

export { logger };

// Funciones helper para diferentes tipos de logs
export const logRequest = (
  method: string,
  path: string,
  duration?: number,
  userAgent?: string,
) => {
  const message = `${method} ${path}${duration ? ` - ${duration}ms` : ""}${userAgent ? ` - ${userAgent.slice(0, 50)}` : ""}`;
  logger.info(`🌐 HTTP: ${message}`);
};

export const logTRPCCall = (
  type: string,
  path: string,
  duration: number,
  success: boolean,
  input?: unknown,
  error?: string,
) => {
  const emoji = success ? "✅" : "❌";
  const status = success ? "SUCCESS" : "ERROR";

  let message = `${emoji} tRPC ${type.toUpperCase()} ${path} - ${duration}ms - ${status}`;

  if (input && Object.keys(input).length > 0) {
    message += `\n   Input: ${JSON.stringify(input, null, 2)}`;
  }

  if (error) {
    message += `\n   Error: ${error}`;
  }

  if (success) {
    logger.info(message);
  } else {
    logger.error(message);
  }
};

export const logStartup = (port: number) => {
  logger.info(`🚀 Servidor tRPC iniciado en puerto ${port}`);
  logger.info(`📊 Sistema de logging configurado`);
  logger.info(`📁 Logs guardados en: logs/combined.log y logs/error.log`);
};
