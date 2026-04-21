const DEFAULT_BILIBILI_UID = '27553104';

export function getBilibiliUid(env: { BILIBILI_UID?: string }): string {
  return env.BILIBILI_UID?.trim() || DEFAULT_BILIBILI_UID;
}
