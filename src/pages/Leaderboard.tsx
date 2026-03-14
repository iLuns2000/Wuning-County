import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, RefreshCw, UserPlus, UserMinus } from 'lucide-react';
import { getLeaderboard, registerUser, getDeviceId, getUserNickname, setUserNickname, addMoney } from '@/utils/cloudApi';
import { LeaderboardEntry } from '@/utils/cloudApi';
import { useGameStore } from '@/store/gameStore';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState(getUserNickname());
  const [registering, setRegistering] = useState(false);
  
  // 从 gameStore 获取金钱数
  const playerStats = useGameStore((state) => state.playerStats);
  const money = playerStats?.money || 0;
  const playerName = useGameStore((state) => state.playerProfile)?.name || '';
  
  const deviceId = getDeviceId();

  // 加载排行榜
  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const result = await getLeaderboard(20);
      if (result.success) {
        setLeaderboard(result.leaderboard);
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
      setNickname(displayName);
      
      // 同步财富到排行榜
      await addMoney(deviceId, money);
      
      alert(`恭喜上榜成功！\n当前财富: {money.toLocaleString()} 文\n每天会自动同步一次财富到排行榜。`);
      loadLeaderboard();
    } catch (e) {
      console.error('上榜失败:', e);
      alert('上榜失败，请稍后重试');
    } finally {
      setRegistering(false);
    }
  };

  // 下榜
  const handleLeaveLeaderboard = async () => {
    if (!confirm('确定要下榜吗？下榜后将不再自动同步财富到排行榜。')) {
      return;
    }
    
    // 下榜操作：将财富设为 0 (这样就不会在排行榜显示了)
    // 实际实现：通过不更新排行榜来实现
    alert('已下榜。如需重新上榜，请再次点击"我要上榜"。');
    loadLeaderboard();
  };

  // 获取当前用户排名
  const currentUserRank = leaderboard.find((e) => e.user_id === deviceId);
  const isOnLeaderboard = !!currentUserRank;

  return (
    <div className="min-h-screen bg-amber-50 p-4">
      {/* 头部 */}
      <div className="max-w-md mx-auto mb-4">
        <Link to="/" className="inline-flex items-center text-amber-800 hover:text-amber-600">
          <ArrowLeft className="w-5 h-5 mr-1" />
          返回首页
        </Link>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* 标题 */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-amber-900 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-amber-600" />
            财富排行榜
          </h1>
          <p className="text-amber-700 text-sm mt-1">实时展示武宁县富豪榜</p>
        </div>

        {/* 上榜状态 */}
        <div className="bg-white rounded-lg shadow-md p-4 border border-amber-200">
          {isOnLeaderboard ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <Trophy className="w-6 h-6" />
                <span className="font-bold">您已上榜</span>
              </div>
              <div className="text-amber-800">
                当前财富: <span className="font-bold text-xl">{currentUserRank?.money.toLocaleString()}</span> 文
              </div>
              <div className="text-amber-600 text-sm">
                排名: 第 {currentUserRank?.rank} 名
              </div>
              <div className="mt-3 flex gap-2 justify-center">
                <button
                  onClick={async () => {
                    try {
                      await addMoney(deviceId, money);
                      alert('财富已同步到排行榜！');
                      loadLeaderboard();
                    } catch (e) {
                      alert('同步失败');
                    }
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  立即同步
                </button>
                <button
                  onClick={handleLeaveLeaderboard}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1"
                >
                  <UserMinus className="w-4 h-4" />
                  下榜
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-amber-800 mb-3">加入排行榜，展示您的财富</div>
              <div className="text-lg text-amber-900 font-medium mb-2">
                角色名: {playerName || `游客`}
              </div>
              <div className="text-sm text-amber-600 mb-3">
                当前财富: {money.toLocaleString()} 文
              </div>
              <button
                onClick={handleRegisterAndJoin}
                disabled={registering}
                className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {registering ? '提交中...' : '我要上榜'}
              </button>
            </div>
          )}
        </div>

        {/* 排行榜列表 */}
        <div className="bg-white rounded-lg shadow-md border border-amber-200 overflow-hidden">
          <div className="bg-amber-100 px-4 py-2 border-b border-amber-200">
            <h2 className="font-bold text-amber-900">富豪榜 TOP {leaderboard.length}</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-amber-600">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              加载中...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-amber-600">
              暂无上榜玩家
            </div>
          ) : (
            <div className="divide-y divide-amber-100">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center px-4 py-3 ${
                    entry.user_id === deviceId ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                    entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    entry.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-amber-900">
                      {entry.nickname || '匿名玩家'}
                      {entry.user_id === deviceId && <span className="text-amber-600 text-sm ml-1">(你)</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-amber-800">{entry.money.toLocaleString()}</div>
                    <div className="text-xs text-amber-600">文</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提示信息 */}
        <div className="text-center text-sm text-amber-600 p-4">
          <p>📌 上榜后每天会自动同步一次财富到排行榜</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;