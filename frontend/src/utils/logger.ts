// Centralized logging utility for debugging and monitoring

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private createLogEntry(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context
    };
  }

  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('debug', message, data, context);
    this.storeLog(entry);
    
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${context ? `[${context}] ` : ''}${message}`, data || '');
    }
  }

  info(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('info', message, data, context);
    this.storeLog(entry);
    
    console.info(`[INFO] ${context ? `[${context}] ` : ''}${message}`, data || '');
  }

  warn(message: string, data?: any, context?: string): void {
    const entry = this.createLogEntry('warn', message, data, context);
    this.storeLog(entry);
    
    console.warn(`[WARN] ${context ? `[${context}] ` : ''}${message}`, data || '');
  }

  error(message: string, error?: any, context?: string): void {
    const entry = this.createLogEntry('error', message, error, context);
    this.storeLog(entry);
    
    console.error(`[ERROR] ${context ? `[${context}] ` : ''}${message}`, error || '');
    
    // In production, you might want to send errors to a monitoring service
    if (!this.isDevelopment) {
      this.sendToMonitoring(entry);
    }
  }

  private sendToMonitoring(_entry: LogEntry): void {
    // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(_entry);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Log environment info on initialization
  logEnvironment(): void {
    this.info('Environment initialized', {
      nodeEnv: process.env.NODE_ENV,
      apiUrl: process.env.REACT_APP_API_URL,
      hasGoogleClientId: !!process.env.REACT_APP_GOOGLE_CLIENT_ID,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }, 'Environment');
  }
}

export const logger = new Logger();

// Log environment on module load
logger.logEnvironment();

export default logger;
