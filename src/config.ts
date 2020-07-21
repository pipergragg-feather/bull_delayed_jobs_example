abstract class ConfigVars {
  abstract get STATSD_HOST(): string;
  abstract get STATSD_PORT(): string;

  abstract get REDIS_HOST(): string;
  abstract get REDIS_PORT(): string;
}

class DevelopmentConfigVars extends ConfigVars {
  STATSD_HOST = 'STATSD_HOST must be configured';
  STATSD_PORT = '8125';
  REDIS_HOST = 'REDIS_HOST must be configured';
  REDIS_PORT = '6379';
}
class TestConfigVars extends DevelopmentConfigVars {
}

class QAConfigVars extends ConfigVars {
  STATSD_HOST = 'STATSD_HOST must be configured';
  STATSD_PORT = '8125';
  REDIS_HOST = 'REDIS_HOST must be configured';
  REDIS_PORT = '6379';
}

class ProductionConfigVars extends QAConfigVars {
}

class Config {
  private static environments(): Map<Config.Environment, ConfigVars> {
    return new Map([
      [Config.Environment.production, new ProductionConfigVars()],
      [Config.Environment.qa, new QAConfigVars()],
      [Config.Environment.development, new DevelopmentConfigVars()],
      [Config.Environment.test, new TestConfigVars()],
    ]);
  }

  private static nodeEnv() {
    return String(process.env.NODE_ENV || 'development').toLowerCase();
  }

  private static envConfig() {
    const configForCurrentEnv = this.environments().get(this.nodeEnv() as Config.Environment);
    if (!configForCurrentEnv) {
      throw new Error(`Could not find worker config for environment: ${this.nodeEnv()}`);
    }
    return configForCurrentEnv;
  }

  static get = (variable: Config.EnvVar) => {
    const config = Config.envConfig();
    console.log({variable})
    const configValue = process.env[variable] || config[variable];
    console.log({configValue})
    if (typeof configValue !== 'string') {
      throw new Error(`Missing environment variable: ${variable}`);
    }

    return configValue;
  };
}

namespace Config {
  export enum EnvVar {
    STATSD_HOST = 'STATSD_HOST',
    STATSD_PORT = 'STATSD_PORT',
    REDIS_HOST = 'REDIS_HOST',
    REDIS_PORT = 'REDIS_PORT',
  }
  export enum Environment {
    production = 'production',
    qa = 'qa',
    development = 'development',
    test = 'test',
  }
}

export { Config };
