// 云存档 API 服务
// 对接后端: http://localhost:3000

const API_BASE = 'http://106.54.50.15:3000/api';

// 通用请求函数
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// ========== 云存档 API ==========

export interface CloudSaveUploadResponse {
  success: boolean;
  save_id?: string;
  sync_id?: string;
  expires_at?: string;
  message?: string;
  error?: string;
}

export interface CloudSaveDownloadResponse {
  success: boolean;
  save_id?: string;
  user_id?: string;
  save_data?: string;
  from_cache?: boolean;
  error?: string;
}

export interface CloudSave {
  save_id: string;
  created_at: string;
  expires_at: string;
  sync_id_used: number;
}

// 上传云存档
export async function uploadCloudSave(userId: string, saveData: string): Promise<CloudSaveUploadResponse> {
  return request<CloudSaveUploadResponse>('/saves/upload', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      save_data: saveData,
    }),
  });
}

// 下载云存档
export async function downloadCloudSave(saveId?: string, syncId?: string): Promise<CloudSaveDownloadResponse> {
  return request<CloudSaveDownloadResponse>('/saves/download', {
    method: 'POST',
    body: JSON.stringify({
      save_id: saveId,
      sync_id: syncId,
    }),
  });
}

// 获取用户存档列表
export async function listCloudSaves(userId: string): Promise<{ success: boolean; count: number; saves: CloudSave[]; error?: string }> {
  return request('/saves/list', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

// 删除云存档
export async function deleteCloudSave(saveId: string, userId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  return request('/saves/delete', {
    method: 'POST',
    body: JSON.stringify({ save_id: saveId, user_id: userId }),
  });
}

// ========== 用户 API ==========

export interface UserInfo {
  user_id: string;
  nickname: string;
  money: number;
  rank: number | null;
  created_at: string;
}

export interface UserResponse {
  success: boolean;
  user?: UserInfo;
  error?: string;
}

// 注册/更新用户
export async function registerUser(userId: string, nickname?: string): Promise<UserResponse> {
  return request('/user/register', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      nickname: nickname,
    }),
  });
}

// 获取用户信息
export async function getUserInfo(userId: string): Promise<UserResponse> {
  return request('/user/info', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

// ========== 金钱 API ==========

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  nickname: string | null;
  money: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardEntry[];
  error?: string;
}

// 获取排行榜
export async function getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
  return request(`/money/leaderboard?limit=${limit}`, {
    method: 'GET',
  });
}

// 增加金钱 (管理员用)
export async function addMoney(userId: string, amount: number): Promise<{ success: boolean; new_money?: number; error?: string }> {
  return request('/money/add', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, amount }),
  });
}

// 赠送金钱 (上榜时同步财富)
export async function syncMoney(fromUserId: string, toUserId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  return request('/money/give', {
    method: 'POST',
    body: JSON.stringify({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      amount,
    }),
  });
}

// 获取交易记录
export async function getTransactions(userId: string): Promise<{ success: boolean; count: number; transactions: any[] }> {
  return request('/money/transactions', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

// ========== 便捷函数 ==========

// 生成设备唯一ID
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('wuning_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('wuning_device_id', deviceId);
  }
  return deviceId;
}

// 获取用户显示名称
export function getUserNickname(): string {
  return localStorage.getItem('wuning_nickname') || '';
}

// 设置用户显示名称
export function setUserNickname(nickname: string): void {
  localStorage.setItem('wuning_nickname', nickname);
}