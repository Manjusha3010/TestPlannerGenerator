/** Site root for Jira REST (no /jira path). */
export function normalizeJiraSiteUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
  u = u.replace(/\/jira\/?$/i, "");
  return u;
}

/**
 * Confluence Cloud REST lives under .../wiki/rest/api
 * Accepts https://tenant.atlassian.net or .../wiki
 */
export function normalizeConfluenceBaseUrl(url: string): string {
  let u = url.trim().replace(/\/+$/, "");
  if (!/\/wiki$/i.test(u)) {
    u = `${u}/wiki`;
  }
  return u;
}
