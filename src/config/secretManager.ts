import * as vscode from 'vscode';

const SECRET_KEY = 'youcommit.apiKey';
const SERVICE_KEY = 'youcommit.serviceKey';

export class SecretManager {
  constructor(private readonly secrets: vscode.SecretStorage) { }

  // ---- BYOK API Key ----

  async getApiKey(): Promise<string | undefined> {
    return this.secrets.get(SECRET_KEY);
  }

  async setApiKey(key: string): Promise<void> {
    await this.secrets.store(SECRET_KEY, key);
  }

  async deleteApiKey(): Promise<void> {
    await this.secrets.delete(SECRET_KEY);
  }

  async getMaskedApiKey(): Promise<string | undefined> {
    const key = await this.getApiKey();
    if (!key || key.length < 8) {
      return key;
    }
    return key.slice(0, 3) + '****' + key.slice(-4);
  }

  async hasApiKey(): Promise<boolean> {
    const key = await this.getApiKey();
    return !!key && key.length > 0;
  }

  // ---- Builtin Service Key ----

  async getServiceKey(): Promise<string | undefined> {
    return this.secrets.get(SERVICE_KEY);
  }

  async setServiceKey(key: string): Promise<void> {
    await this.secrets.store(SERVICE_KEY, key);
  }

  async hasServiceKey(): Promise<boolean> {
    const key = await this.getServiceKey();
    return !!key && key.length > 0;
  }
}
