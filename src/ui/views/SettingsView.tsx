import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  Globe,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { GameState, GameMode, Language } from '../../types/game';
import { translate } from '../../locales/i18n';
import { DEFAULT_DEEPSEEK_MODEL, getConfiguredDeepSeekKey } from '../../ai/deepseek';
import {
  listSaveSlots,
  saveGameState,
  loadGameState,
  exportSaveFile,
  importSaveFile,
  SaveSlotMetadata
} from '../../storage/saveManager';

interface SettingsViewProps {
  state: GameState;
  onUpdateState: (updater: (prev: GameState) => GameState) => void;
  onResetGame: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  state,
  onUpdateState,
  onResetGame
}) => {
  const lang = state.language;
  const isAr = lang === 'ar';
  const [saveSlots, setSaveSlots] = useState<SaveSlotMetadata[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>(state.deepseekApiKey || '');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  const hasActiveKey = Boolean(getConfiguredDeepSeekKey(state.deepseekApiKey));

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveAiConfig = () => {
    const trimmed = apiKeyInput.trim();
    onUpdateState(prev => ({
      ...prev,
      deepseekApiKey: trimmed || undefined
    }));
    showToast(
      trimmed
        ? (isAr ? 'تم حفظ إعدادات الذكاء الاصطناعي بنجاح.' : 'AI configuration saved.')
        : (isAr ? 'تم حذف مفتاح الذكاء الاصطناعي والرجوع للوضع المحلي.' : 'API key cleared; offline fallback active.')
    );
  };

  const refreshSlots = () => {
    setSaveSlots(listSaveSlots());
  };

  useEffect(() => {
    refreshSlots();
  }, []);

  const handleSaveToSlot = (slotId: string) => {
    const success = saveGameState(slotId, state);
    if (success) {
      setNotification(isAr ? `تم حفظ اللعبة بنجاح في ${slotId}!` : `Game saved successfully to ${slotId}!`);
      refreshSlots();
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLoadFromSlot = (slotId: string) => {
    const loaded = loadGameState(slotId);
    if (loaded) {
      onUpdateState(() => loaded);
      setNotification(isAr ? `تم استرجاع اللعبة من ${slotId}!` : `Game loaded successfully from ${slotId}!`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExport = () => {
    exportSaveFile(state);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importSaveFile(file);
      onUpdateState(() => imported);
      setNotification(isAr ? 'تم استيراد ملف الحفظ بنجاح!' : 'Save file imported successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch {
      alert(isAr ? 'خطأ: ملف الحفظ غير صالح.' : 'Error: Invalid save file.');
    }
  };

  const setDifficulty = (mode: GameMode) => {
    onUpdateState(prev => ({ ...prev, gameMode: mode }));
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-xl font-bold text-white">
              {translate(lang, 'settings.title')}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'إعدادات صعوبة المحاكاة، اختيار اللغة، وإدارة ملفات وخانات الحفظ'
                : 'Difficulty mode, language toggle, and save/load state persistence'}
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Difficulty Modes Grid */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>{translate(lang, 'settings.gameMode')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sandbox */}
          <div
            onClick={() => setDifficulty('sandbox')}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
              state.gameMode === 'sandbox'
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center font-bold text-sm">
              <span>Sandbox</span>
              {state.gameMode === 'sandbox' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {translate(lang, 'settings.sandbox')}
            </p>
          </div>

          {/* Normal */}
          <div
            onClick={() => setDifficulty('normal')}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
              state.gameMode === 'normal'
                ? 'bg-sky-950/40 border-sky-500 text-sky-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center font-bold text-sm">
              <span>Normal</span>
              {state.gameMode === 'normal' && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {translate(lang, 'settings.normal')}
            </p>
          </div>

          {/* Hard */}
          <div
            onClick={() => setDifficulty('hard')}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
              state.gameMode === 'hard'
                ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-center font-bold text-sm">
              <span>Hard</span>
              {state.gameMode === 'hard' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              {translate(lang, 'settings.hard')}
            </p>
          </div>
        </div>
      </div>

      {/* DeepSeek AI Configuration */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isAr ? 'إعدادات المستشار الاستراتيجي (DeepSeek AI)' : 'Strategic AI Advisor (DeepSeek)'}</span>
          </h3>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            hasActiveKey
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {hasActiveKey
              ? (isAr ? 'متصل بمفتاح مخصص' : 'Custom Key Active')
              : (isAr ? 'الوضع المحلي التلقائي' : 'Offline Fallback Mode')}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {isAr
            ? 'يُحفظ مفتاح DeepSeek محلياً داخل متصفحك فقط ولا يتم تضمين أي مفاتيح سرية في الشيفرة المصدرية. عند تركه فارغاً تعمل اللعبة بالمحرك المحلي التلقائي.'
            : 'Your DeepSeek API key is stored locally in your browser only. Leaving it empty uses the built-in deterministic offline advisor.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'مفتاح DeepSeek API' : 'DeepSeek API Key'}</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                dir="ltr"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 ps-3 pe-10 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(v => !v)}
                className="absolute end-2.5 text-slate-400 hover:text-white"
                aria-label={showApiKey ? 'Hide key' : 'Show key'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {isAr ? 'النموذج المستخدم' : 'Model'}
            </label>
            <select
              value={state.deepseekModel || DEFAULT_DEEPSEEK_MODEL}
              onChange={e =>
                onUpdateState(prev => ({
                  ...prev,
                  deepseekModel: e.target.value
                }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="deepseek-chat">deepseek-chat</option>
              <option value="deepseek-reasoner">deepseek-reasoner</option>
              <option value="deepseek-v4-pro">deepseek-v4-pro</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveAiConfig}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            {isAr ? 'حفظ إعدادات AI' : 'Save AI Settings'}
          </button>
          {apiKeyInput && (
            <button
              type="button"
              onClick={() => {
                setApiKeyInput('');
                onUpdateState(prev => ({ ...prev, deepseekApiKey: undefined }));
                showToast(isAr ? 'تم مسح المفتاح والعودة للوضع المحلي.' : 'Key cleared.');
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              {isAr ? 'مسح المفتاح' : 'Clear Key'}
            </button>
          )}
        </div>
      </div>

      {/* Save / Load Slots Grid */}
      <div className="bg-[#111a2e] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Save className="w-4 h-4 text-emerald-400" />
            <span>{translate(lang, 'settings.saveSlots')}</span>
          </h3>

          {/* Export / Import Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{translate(lang, 'settings.exportSave')}</span>
            </button>

            <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{translate(lang, 'settings.importSave')}</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {saveSlots.map(slot => (
            <div
              key={slot.slotId}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-white">{slot.name}</span>
                  {slot.isEmpty ? (
                    <span className="text-[10px] text-slate-500">{isAr ? 'فارغة' : 'Empty'}</span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-semibold">{slot.gameDate}</span>
                  )}
                </div>

                {!slot.isEmpty && (
                  <div className="text-[11px] text-slate-400 mt-2 space-y-0.5">
                    <div>PM: <strong className="text-slate-200">{slot.primeMinister}</strong></div>
                    <div>Approval: <strong className="text-emerald-400">{slot.approval}%</strong></div>
                    <div className="text-[10px] text-slate-500 truncate mt-1">Saved: {slot.savedAt}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleSaveToSlot(slot.slotId)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white"
                >
                  {translate(lang, 'settings.saveToSlot')}
                </button>

                {!slot.isEmpty && (
                  <button
                    onClick={() => handleLoadFromSlot(slot.slotId)}
                    className="flex-1 py-1 bg-emerald-700/40 hover:bg-emerald-600/50 border border-emerald-600/50 rounded-lg text-[11px] font-bold text-emerald-200"
                  >
                    {translate(lang, 'settings.loadFromSlot')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Simulation Section */}
      <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{isAr ? 'إعادة ضبط المحاكاة بالكامل' : 'Reset Simulation'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? 'إعادة بدء ولاية حكومية جديدة من يناير 2026 وحذف التعديلات غير المحفوظة.'
              : 'Restart a new term from January 2026 and revert unsaved progress.'}
          </p>
        </div>

        <button
          onClick={onResetGame}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{translate(lang, 'settings.resetGame')}</span>
        </button>
      </div>
    </div>
  );
};
