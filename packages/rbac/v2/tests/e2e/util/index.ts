// obtains offline access token given clientId and refreshToken values
import axios, { AxiosProxyConfig, AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
import { Configuration } from '@redhat-cloud-services/javascript-clients-shared/configuration';

export const RBAC_API_BASE = process.env.RBAC_API_BASE ? process.env.RBAC_API_BASE : '';
if (!RBAC_API_BASE) throw new Error('RBAC_API_BASE environment variable required');

class TokenContext {
  tokenUrl: string | undefined;
  clientId: string | undefined;
  refreshToken: string | undefined;

  load() {
    this.tokenUrl = process.env.AUTH_TOKEN_URL ? process.env.AUTH_TOKEN_URL : '';
    if (!this.tokenUrl) throw new Error('AUTH_TOKEN_URL was not set in env, fix config');
    this.clientId = process.env.AUTH_CLIENT_ID ? process.env.AUTH_CLIENT_ID : '';
    if (!this.clientId) throw new Error('AUTH_CLIENT_ID was not set in env, fix config');
    this.refreshToken = process.env.AUTH_REFRESH_TOKEN ? process.env.AUTH_REFRESH_TOKEN : '';
    if (!this.refreshToken) throw new Error('refreshToken was not set in env, fix config');
  }
}

export class ProxyConfig {
  proxyHost: string | undefined;
  proxyPort: string | undefined;
  proxyProto: string | undefined;

  load() {
    this.proxyHost = process.env.PROXY_URL;
    if (!this.proxyHost) throw new Error('proxy host value not configured in env, fix config');
    this.proxyPort = process.env.PROXY_PORT;
    if (!this.proxyPort) throw new Error('proxy port value not configured in env, fix config');
    this.proxyProto = process.env.PROXY_PROTOCOL;
    if (!this.proxyProto) throw new Error('proxy protocol value not configured in env, fix config');
  }
}

export async function accessToken() {
  const tokenContext = new TokenContext();
  tokenContext.load();
  const body = {
    grant_type: 'refresh_token',
    client_id: tokenContext.clientId,
    refresh_token: tokenContext.refreshToken,
    scope: 'offline_access',
  };
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(body),
    url: tokenContext.tokenUrl,
  };

  return axios(options).then((response: AxiosResponse) => {
    return response.data.access_token;
  });
}

export async function updateConfig(config: Configuration, basePath: string) {
  // Adds the bearer token, basePath, and proxy info into the configuration object
  const proxyConfig = new ProxyConfig();
  proxyConfig.load();
  config.accessToken = await accessToken();
  config.basePath = basePath;
  config.baseOptions = {};
  config.baseOptions = {
    headers: {
      authorization: `Bearer ${config.accessToken}`,
    },
    proxy: {
      protocol: proxyConfig.proxyProto,
      host: proxyConfig.proxyHost,
      port: proxyConfig.proxyPort,
    },
  };
  return config;
}

// translates the normal Configuration object into AxiosRequestConfig
export const convertConfig: (config: Configuration) => Promise<AxiosRequestConfig<any>> = async (config: Configuration) => {
  const proxyConfig: AxiosProxyConfig = {
    protocol: config.baseOptions.proxy.protocol,
    host: config.baseOptions.proxy.host,
    port: config.baseOptions.proxy.port,
  };

  const axiosRequestConfig: AxiosRequestConfig = {
    baseURL: config.basePath,
    headers: { Authorization: `Bearer ${config.accessToken}` },
    proxy: proxyConfig,
  };
  return axiosRequestConfig;
};
