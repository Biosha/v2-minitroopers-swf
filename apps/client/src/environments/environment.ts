// SELF_URL is injected at build time (see scripts/build.mjs)
declare const SELF_URL: string | undefined;

const selfUrl = (
  typeof SELF_URL === 'string' && SELF_URL ? SELF_URL : window.location.origin
).replace(/\/+$/, '');

export const environment = {
  production: true,
  apiUrl: selfUrl,
  inviteUrl: `${selfUrl}/`,
  assetsUrl: `${selfUrl}/`,
  enableAdminRoute: false,
};
