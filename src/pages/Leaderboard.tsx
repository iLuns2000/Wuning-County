import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, RefreshCw, UserPlus, UserMinus, Medal } from 'lucide-react';
import { getLeaderboard, registerUser, getDeviceId, setUserNickname, addMoney, setMoney, removeFromLeaderboard, deleteUser } from '@/utils/cloudApi';
import { LeaderboardEntry } from '@/utils/cloudApi';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUserJoined, setHasUserJoined] = useState(false); // 用户是否曾上榜
  
  const vibrate = useGameVibrate();
  
  // 从 gameStore 获取金钱数
  const playerStats = useGameStore((state) => state.playerStats);
  const money = playerStats?.money || 0;
  const playerName = useGameStore((state) => state.playerProfile)?.name || '';
  
  const deviceId = getDeviceId();
  const PAGE_SIZE = 50; // 每页50人

  // 加载排行榜
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // 获取前50名
      const result = await getLeaderboard(PAGE_SIZE);
      if (result.success) {
        setLeaderboard(result.leaderboard);
        // 检查当前用户是否在榜上
        const isOnBoard = result.leaderboard.some(e => e.user_id === deviceId);
        setHasUserJoined(isOnBoard);
      }
    } catch (e) {
      console.error('加载排行榜失败:', e);
    } finally {
      setLoading(false);
    }
  };

  // 加载排行榜

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // 注册/更新用户并上榜
  const handleRegisterAndJoin = async () => {
    // 直接使用游戏中的角色名称
    const displayName = playerName || `玩家${deviceId.slice(-4)}`;
    
    setRegistering(true);
    try {
      // 先注册用户
      await registerUser(deviceId, displayName);
      setUserNickname(displayName);
      
      // 同步财富到排行榜 (设置为当前财富，替换而非累加)
      await setMoney(deviceId, money);
      
      alert(`恭喜上榜成功！\n当前财富: ${money.toLocaleString()} 文\n每天会自动同步一次财富到排行榜。`);
      setHasUserJoined(true);
      loadLeaderboard();
    } catch (e) {
      console.error('上榜失败:', e);
      alert('上榜失败，请稍后重试');
    } finally {
      setRegistering(false);
    }
  };

  // 下榜 - 删除用户数据
  const handleLeaveLeaderboard = async () => {
    if (!confirm('确定要下榜吗？下榜后将删除您的所有数据。')) {
      return;
    }
    
    try {
      // 删除用户数据
      await deleteUser(deviceId);
      setHasUserJoined(false);
      alert('已下榜，数据已删除。如需重新上榜，请再次点击"重新上榜"。');
      loadLeaderboard();
    } catch (e) {
      console.error('下榜失败:', e);
      alert('下榜失败，请稍后重试');
    }
  };

  // 获取当前用户排名
  const currentUserRank = leaderboard.find((e) => e.user_id === deviceId);
  const isOnLeaderboard = hasUserJoined || !!currentUserRank;

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-indigo-50 to-indigo-100/50">
      {/* 头部 */}
      <div className="mx-auto mb-4 max-w-md">
        <Link to="/" className="inline-flex items-center text-indigo-700 hover:text-indigo-500">
          <ArrowLeft className="mr-1 w-5 h-5" />
          返回首页
        </Link>
      </div>

      <div className="mx-auto space-y-4 max-w-md">
        {/* 标题 */}
        <div className="py-4 text-center">
          <h1 className="flex gap-2 justify-center items-center text-2xl font-bold text-indigo-900">
            <Medal className="w-8 h-8 text-indigo-600" />
            富豪榜
          </h1>
          <p className="mt-1 text-sm text-indigo-700">无宁县富甲天下排行</p>
        </div>

        {/* 上榜状态 - 官府风格卡片 */}
        <div className="overflow-hidden bg-white rounded-lg border border-indigo-100 shadow-lg">
          <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
            <h2 className="flex gap-2 items-center font-bold text-indigo-900">
              <Trophy className="w-4 h-4 text-indigo-600" />
              我的榜帖
            </h2>
          </div>
          <div className="p-4">
            {isOnLeaderboard ? (
              <div className="text-center">
                <div className="flex gap-2 justify-center items-center mb-3 text-green-600">
                  <Trophy className="w-6 h-6" />
                  <span className="font-bold">榜上有名</span>
                </div>
                <div className="mb-2 text-indigo-900">
                  当前财富: <span className="text-xl font-bold text-indigo-700">{currentUserRank?.money.toLocaleString()}</span> 文
                </div>
                <div className="mb-4 text-sm text-indigo-600">
                  排名: 第 <span className="font-bold">{currentUserRank?.rank}</span> 名
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={async () => {
                      vibrate(VIBRATION_PATTERNS.LIGHT);
                      try {
                        // 使用 setMoney 替换财富，而非累加
                        await setMoney(deviceId, money);
                        alert(`财富已同步！\n当前财富: ${money.toLocaleString()} 文`);
                        loadLeaderboard();
                      } catch (e) {
                        alert('同步失败');
                      }
                    }}
                    className="flex gap-1 items-center px-4 py-2 text-white bg-indigo-600 rounded-lg transition-colors hover:bg-indigo-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    同步财富
                  </button>
                  <button
                    onClick={() => {
                      vibrate(VIBRATION_PATTERNS.LIGHT);
                      handleLeaveLeaderboard();
                    }}
                    className="flex gap-1 items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200"
                  >
                    <UserMinus className="w-4 h-4" />
                    下榜
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4 text-indigo-800">登榜展示您的万贯家财</div>
                <div className="mb-2 text-lg font-medium text-indigo-900">
                  角色名: {playerName || `游客`}
                </div>
                <div className="mb-4 text-sm text-indigo-600">
                  当前财富: {money.toLocaleString()} 文
                </div>
                <button
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.HEAVY);
                    handleRegisterAndJoin();
                  }}
                  disabled={registering}
                  className="flex gap-2 justify-center items-center px-4 py-3 w-full text-white bg-indigo-600 rounded-lg transition-colors hover:bg-indigo-700 disabled:opacity-50"
                >
                  <UserPlus className="w-5 h-5" />
                  {registering ? '提交中...' : (hasUserJoined ? '重新上榜' : '我要上榜')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 排行榜列表 - 官府风格 */}
        <div className="overflow-hidden bg-white rounded-lg border border-indigo-100 shadow-lg">
          <div className="px-4 py-3 bg-indigo-600">
            <h2 className="flex gap-2 items-center font-bold text-white">
              <Medal className="w-4 h-4" />
              富豪排行 TOP {leaderboard.length + 1} (每页50人)
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-indigo-500">
              <RefreshCw className="mx-auto mb-2 w-6 h-6 animate-spin" />
              官府正在整理榜文...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-indigo-500">
              暂无上榜商贾
            </div>
          ) : (
            <div className="divide-y divide-indigo-50">
              {/* 固定第一名：小四(无宁县首富) */}
              <div className="flex items-center px-4 py-3 bg-gradient-to-r from-yellow-50 to-yellow-100/50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold bg-yellow-400 text-yellow-900">
                  1
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium text-indigo-900">
                    小四<span className="text-yellow-600 text-sm ml-1">(无宁县首富)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-800">*************</div>
                  <div className="text-xs text-indigo-500">文</div>
                </div>
              </div>
              {/* 真实排行榜 - 从第2名开始 */}
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center px-4 py-3 hover:bg-indigo-50/50 transition-colors ${
                    entry.user_id === deviceId ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    entry.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {entry.rank + 1}
                  </div>
                  <div className="flex-1 ml-3">
                    <div className="font-medium text-indigo-900">
                      {entry.nickname || '匿名商贾'}
                      {entry.user_id === deviceId && <span className="ml-1 text-sm text-indigo-500">(您)</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-800">{entry.money.toLocaleString()}</div>
                    <div className="text-xs text-indigo-500">文</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提示信息 */}
        <div className="p-4 text-sm text-center text-indigo-500 bg-indigo-50 rounded-lg border border-indigo-100">
          <p>📌 上榜后每日自动同步财富至官府榜文</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;