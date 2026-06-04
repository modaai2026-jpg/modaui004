/**
 * Socialite-inspired Auth Provider System for Node.js
 * Handles multiple social login platforms with a unified interface.
 */

export interface SocialUser {
  id: string;
  nickname: string;
  name: string;
  email: string;
  avatar: string;
  raw: any;
  provider: string;
}

export abstract class BaseProvider {
  protected clientId: string;
  protected clientSecret: string;
  protected redirectUri: string;

  constructor(config: { clientId: string; clientSecret: string; redirectUri: string }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  abstract getAuthUrl(): string;
  abstract getUserByCode(code: string): Promise<SocialUser>;
}

export class GitHubProvider extends BaseProvider {
  getAuthUrl(): string {
    return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&scope=user:email`;
  }

  async getUserByCode(code: string): Promise<SocialUser> {
    // 1. Exchange code for token
    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri
      })
    });
    const { access_token } = await tokenResp.json() as any;

    // 2. Get user info
    const userResp = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `token ${access_token}` }
    });
    const rawUser = await userResp.json() as any;

    return {
      id: rawUser.id.toString(),
      nickname: rawUser.login,
      name: rawUser.name || rawUser.login,
      email: rawUser.email,
      avatar: rawUser.avatar_url,
      raw: rawUser,
      provider: 'github'
    };
  }
}

export class WeChatProvider extends BaseProvider {
  getAuthUrl(): string {
    return `https://open.weixin.qq.com/connect/qrconnect?appid=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=snsapi_login#wechat_redirect`;
  }

  async getUserByCode(code: string): Promise<SocialUser> {
    // Mock implementation for demo
    return {
      id: 'wx_' + Math.random().toString(36).slice(2),
      nickname: '微信用户',
      name: 'WeChat User',
      email: 'wechat@example.com',
      avatar: '',
      raw: {},
      provider: 'wechat'
    };
  }
}

export class TikoProvider extends BaseProvider {
  getAuthUrl(): string {
    return `https://tiko.io/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
  }

  async getUserByCode(code: string): Promise<SocialUser> {
    return {
      id: 'tiko_' + Math.random().toString(36).slice(2),
      nickname: 'Tiko User',
      name: 'Tiko User',
      email: 'tiko@example.com',
      avatar: '',
      raw: {},
      provider: 'tiko'
    };
  }
}

export class Socialite {
  private static providers: Record<string, BaseProvider> = {};

  static init(config: Record<string, any>) {
    if (config.github) {
      this.providers.github = new GitHubProvider(config.github);
    }
    if (config.wechat) {
      this.providers.wechat = new WeChatProvider(config.wechat);
    }
    if (config.tiko) {
      this.providers.tiko = new TikoProvider(config.tiko);
    }
  }

  static driver(name: string): BaseProvider {
    const provider = this.providers[name];
    if (!provider) throw new Error(`Provider [${name}] not supported or configured.`);
    return provider;
  }
}
