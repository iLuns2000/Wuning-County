import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, RefreshCw, UserPlus, UserMinus, Medal, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { getLeaderboard, registerUser, getDeviceId, setUserNickname, addMoney, setMoney, removeFromLeaderboard, deleteUser, getFavorabilityLeaderboard, setFavorability, getUserFavorabilityInfo } from '@/utils/cloudApi';
import { LeaderboardEntry, FavorabilityLeaderboardEntry } from '@/utils/cloudApi';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

type LeaderboardType = 'money' | 'favorability';

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<(LeaderboardEntry | FavorabilityLeaderboardEntry)[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasUserJoined, setHasUserJoined] = useState(false);
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('money');
  
  const vibrate = useGameVibrate();
  
  // 从 gameStore 获取金钱数和好感度
  const playerStats = useGameStore((state) => state.playerStats);
  const money = playerStats?.money || 0;
  const playerName = useGameStore((state) => state.playerProfile)?.name || '';
  const npcRelations = useGameStore((state) => state.npcRelations) || {};
  
  // 楼县令好感度（单个NPC）
  const countyMagistrateFavorability = npcRelations['lou_xianling'] || 0;
  
  const deviceId = getDeviceId();
  const PAGE_SIZE = 10;

  // 加载排行榜
  const loadLeaderboard = async (type: LeaderboardType, page: number = 1) => {
    setLoading(true);
    const offset = (page - 1) * PAGE_SIZE;
    try {
      let result;
      if (type === 'money') {
        result = await getLeaderboard(PAGE_SIZE, offset);
        if (result.success) {
          setLeaderboard(result.leaderboard);
          const isOnBoard = result.leaderboard.some((e: LeaderboardEntry) => e.user_id === deviceId);
          setHasUserJoined(isOnBoard);
        }
      } else {
        result = await getFavorabilityLeaderboard(PAGE_SIZE, offset);
        if (result.success) {
          setLeaderboard(result.leaderboard);
          const isOnBoard = result.leaderboard.some((e: FavorabilityLeaderboardEntry) => e.user_id === deviceId);
          setHasUserJoined(isOnBoard);
        }
      }
    } catch (e) {
      console.error('加载排行榜失败:', e);
    } finally {
      setLoading(false);
    }
  };

  // 切换排行榜类型
  const handleTypeChange = (type: LeaderboardType) => {
    setLeaderboardType(type);
    setCurrentPage(1);
    loadLeaderboard(type, 1);
  };

  // 翻页
  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
    loadLeaderboard(leaderboardType, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    loadLeaderboard(leaderboardType, currentPage);
  }, []);

  // 注册/更新用户并上榜（财富榜）
  const handleRegisterAndJoinMoney = async () => {
    const displayName = playerName || `玩家${deviceId.slice(-4)}`;
    
    setRegistering(true);
    try {
      await registerUser(deviceId, displayName);
      setUserNickname(displayName);
      await setMoney(deviceId, money);
      
      alert(`恭喜上榜成功！\n当前财富: ${money.toLocaleString()} 文\n每天会自动同步一次财富到排行榜。`);
      setHasUserJoined(true);
      loadLeaderboard('money');
    } catch (e) {
      console.error('上榜失败:', e);
      alert('上榜失败，请稍后重试');
    } finally {
      setRegistering(false);
    }
  };

  // 注册/更新用户并上榜（好感度榜）
  const handleRegisterAndJoinFavorability = async () => {
    const displayName = playerName || `玩家${deviceId.slice(-4)}`;
    
    setRegistering(true);
    try {
      await registerUser(deviceId, displayName);
      setUserNickname(displayName);
      await setFavorability(deviceId, countyMagistrateFavorability);
      
      alert(`恭喜上榜成功！\n当前楼县令好感度: ${countyMagistrateFavorability}\n每天会自动同步一次好感度到排行榜。`);
      setHasUserJoined(true);
      loadLeaderboard('favorability');
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
      await deleteUser(deviceId);
      setHasUserJoined(false);
      alert('已下榜，数据已删除。如需重新上榜，请再次点击"重新上榜"。');
      loadLeaderboard(leaderboardType);
    } catch (e) {
      console.error('下榜失败:', e);
      alert('下榜失败，请稍后重试');
    }
  };

  // 获取当前用户排名
  const currentUserRank = leaderboard.find((e) => e.user_id === deviceId);
  const isOnLeaderboard = hasUserJoined || !!currentUserRank;

  // 获取当前类型的数值
  const currentValue = leaderboardType === 'money' 
    ? money 
    : countyMagistrateFavorability;
  
  const currentDisplayValue = leaderboardType === 'money'
    ? (currentUserRank as LeaderboardEntry)?.money?.toLocaleString() || '0'
    : (currentUserRank as FavorabilityLeaderboardEntry)?.favorability?.toLocaleString() || '0';

  const valueLabel = leaderboardType === 'money' ? '财富' : '县令好感度';
  const unit = leaderboardType === 'money' ? '文' : '点';

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
        {/* 排行榜类型切换 */}
        <div className="flex gap-2 p-2 bg-white rounded-lg shadow-md">
          <button
            onClick={() => handleTypeChange('money')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              leaderboardType === 'money'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Trophy className="inline-block mr-1 w-4 h-4" />
            财富榜
          </button>
          <button
            onClick={() => handleTypeChange('favorability')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              leaderboardType === 'favorability'
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Heart className="inline-block mr-1 w-4 h-4" />
            县令好感榜
          </button>
        </div>

        {/* 标题 */}
        <div className="py-4 text-center">
          <h1 className="flex gap-2 justify-center items-center text-2xl font-bold text-indigo-900">
            {leaderboardType === 'money' ? (
              <>
                <Medal className="w-8 h-8 text-indigo-600" />
                富豪榜
              </>
            ) : (
              <>
                <Heart className="w-8 h-8 text-pink-600" />
                人气榜
              </>
            )}
          </h1>
          <p className="mt-1 text-sm text-indigo-700">
            {leaderboardType === 'money' ? '无宁县富甲天下排行' : '无宁县人脉通达排行'}
          </p>
        </div>

        {/* 上榜状态 */}
        <div className="overflow-hidden bg-white rounded-lg border border-indigo-100 shadow-lg">
          <div className={`px-4 py-3 border-b ${leaderboardType === 'money' ? 'bg-indigo-50' : 'bg-pink-50'}`}>
            <h2 className={`flex gap-2 items-center font-bold ${leaderboardType === 'money' ? 'text-indigo-900' : 'text-pink-900'}`}>
              {leaderboardType === 'money' ? (
                <Trophy className="w-4 h-4 text-indigo-600" />
              ) : (
                <Heart className="w-4 h-4 text-pink-600" />
              )}
              我的榜帖
            </h2>
          </div>
          <div className="p-4">
            {isOnLeaderboard ? (
              <div className="text-center">
                <div className={`flex gap-2 justify-center items-center mb-3 ${leaderboardType === 'money' ? 'text-green-600' : 'text-pink-600'}`}>
                  {leaderboardType === 'money' ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    <Heart className="w-6 h-6" />
                  )}
                  <span className="font-bold">榜上有名</span>
                </div>
                <div className="mb-2 text-indigo-900">
                  当前{valueLabel}: <span className="text-xl font-bold text-indigo-700">{currentDisplayValue}</span> {unit}
                </div>
                <div className="mb-4 text-sm text-indigo-600">
                  排名: 第 <span className="font-bold">{currentUserRank?.rank}</span> 名
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={async () => {
                      vibrate(VIBRATION_PATTERNS.LIGHT);
                      try {
                        if (leaderboardType === 'money') {
                          await setMoney(deviceId, money);
                          alert(`财富已同步！\n当前财富: ${money.toLocaleString()} 文`);
                        } else {
                          await setFavorability(deviceId, countyMagistrateFavorability);
                          alert(`楼县令好感度已同步！\n当前好感度: ${countyMagistrateFavorability}`);
                        }
                        loadLeaderboard(leaderboardType);
                      } catch (e) {
                        alert('同步失败');
                      }
                    }}
                    className={`flex gap-1 items-center px-4 py-2 text-white rounded-lg transition-colors ${
                      leaderboardType === 'money' 
                        ? 'bg-indigo-600 hover:bg-indigo-700' 
                        : 'bg-pink-600 hover:bg-pink-700'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4" />
                    同步{valueLabel}
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
                <div className="mb-4 text-indigo-800">
                  {leaderboardType === 'money' ? '登榜展示您的万贯家财' : '登榜展示您的人脉关系'}
                </div>
                <div className="mb-2 text-lg font-medium text-indigo-900">
                  角色名: {playerName || `游客`}
                </div>
                <div className="mb-4 text-sm text-indigo-600">
                  当前{valueLabel}: {currentValue.toLocaleString()} {unit}
                </div>
                <button
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.HEAVY);
                    if (leaderboardType === 'money') {
                      handleRegisterAndJoinMoney();
                    } else {
                      handleRegisterAndJoinFavorability();
                    }
                  }}
                  disabled={registering}
                  className={`flex gap-2 justify-center items-center px-4 py-3 w-full text-white rounded-lg transition-colors disabled:opacity-50 ${
                    leaderboardType === 'money'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-pink-600 hover:bg-pink-700'
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  {registering ? '提交中...' : (hasUserJoined ? '重新上榜' : '我要上榜')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 排行榜列表 */}
        <div className="overflow-hidden bg-white rounded-lg border border-indigo-100 shadow-lg">
          <div className={`px-4 py-3 ${leaderboardType === 'money' ? 'bg-indigo-600' : 'bg-pink-600'}`}>
            <h2 className="flex gap-2 items-center font-bold text-white">
              <Medal className="w-4 h-4" />
              {leaderboardType === 'money' ? '富豪排行' : '人气排行'} (每页{PAGE_SIZE}人)
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-indigo-500">
              <RefreshCw className="mx-auto mb-2 w-6 h-6 animate-spin" />
              官府正在整理榜文...
            </div>
          ) : (
            <>
              <div className="divide-y divide-indigo-50">
                {/* 固定第一名：县令（好感榜）/ 小四（财富榜） - 仅在第一页显示 */}
                {currentPage === 1 && (
                  leaderboardType === 'money' ? (
                    <div className="flex items-center px-4 py-3 bg-gradient-to-r from-yellow-50 to-yellow-100/50">
                      <div className="flex justify-center items-center w-8 h-8 font-bold text-yellow-900 bg-yellow-400 rounded-full">
                        1
                      </div>
                      <div className="flex-1 ml-3">
                        <div className="font-medium text-indigo-900">
                          小四<span className="ml-1 text-sm text-yellow-600">(无宁县首富)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-800">*************</div>
                        <div className="text-xs text-indigo-500">文</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center px-4 py-3 bg-gradient-to-r from-pink-50 to-pink-100/50">
                      <div className="flex justify-center items-center w-8 h-8 font-bold text-pink-900 bg-pink-400 rounded-full">
                        1
                      </div>
                      <div className="flex-1 ml-3">
                        <div className="font-medium text-pink-900">
                          县令<span className="ml-1 text-sm text-pink-600">(德高望重)</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-pink-800">*************</div>
                        <div className="text-xs text-pink-500">好感度</div>
                      </div>
                    </div>
                  )
                )}
                
                {leaderboard.length === 0 ? (
                  <div className="p-8 text-center text-indigo-500">
                    {leaderboardType === 'money' ? '暂无更多商贾' : '暂无更多人物'}
                  </div>
                ) : (
                  leaderboard.map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center px-4 py-3 hover:bg-indigo-50/50 transition-colors ${
                        entry.user_id === deviceId ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                         entry.rank === 1 ? 'bg-gray-300 text-gray-700' :
                         entry.rank === 2 ? 'bg-amber-600 text-white' :
                         'bg-indigo-100 text-indigo-700'
                       }`}>
                         {entry.rank + 1}
                       </div>
                      <div className="flex-1 ml-3">
                        <div className="font-medium text-indigo-900">
                          {entry.nickname || (leaderboardType === 'money' ? '匿名商贾' : '匿名人士')}
                          {entry.user_id === deviceId && <span className="ml-1 text-sm text-indigo-500">(您)</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-indigo-800">
                          {leaderboardType === 'money' 
                            ? (entry as LeaderboardEntry).money?.toLocaleString()
                            : (entry as FavorabilityLeaderboardEntry).favorability?.toLocaleString()
                          }
                        </div>
                        <div className="text-xs text-indigo-500">{leaderboardType === 'money' ? '文' : '好感度'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 翻页控件 */}
              <div className="flex justify-between items-center p-4 border-t border-indigo-50 bg-indigo-50/30">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-white rounded-md border border-indigo-200 disabled:opacity-50 disabled:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上页
                </button>
                <div className="text-sm font-medium text-indigo-900">
                  第 {currentPage} 页
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={leaderboard.length < PAGE_SIZE}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-white rounded-md border border-indigo-200 disabled:opacity-50 disabled:bg-gray-50"
                >
                  下页
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* 提示信息 */}
        <div className="p-4 text-sm text-center text-indigo-500 bg-indigo-50 rounded-lg border border-indigo-100">
          <p>
            📌 {leaderboardType === 'money' 
              ? '上榜后每日自动同步财富至官府榜文' 
              : '上榜后每日自动同步好感度至官府榜文'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
