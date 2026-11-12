import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Send,
  Loader2,
  X,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { GameState } from '../../types/game';
import { callDeepSeekChat, generateStrategicBriefing } from '../../ai/deepseek';

interface AiAdvisorModalProps {
  state: GameState;
  onClose: () => void;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ state, onClose }) => {
  const isAr = state.language === 'ar';
  const [loadingBriefing, setLoadingBriefing] = useState<boolean>(true);
  const [briefingText, setBriefingText] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load briefing on mount
  useEffect(() => {
    let isMounted = true;
    async function loadBriefing() {
      setLoadingBriefing(true);
      try {
        const text = await generateStrategicBriefing(state);
        if (isMounted) {
          setBriefingText(text);
        }
      } catch (err) {
        if (isMounted) {
          setBriefingText(
            isAr
              ? 'تعذر الاتصال بـ DeepSeek في هذه اللحظة. يرجى التحقق من مفتاح الربط أو المحاولة لاحقاً.'
              : 'Failed to connect to DeepSeek at this moment. Please check API key or retry.'
          );
        }
      } finally {
        if (isMounted) setLoadingBriefing(false);
      }
    }
    loadBriefing();
    return () => {
      isMounted = false;
    };
  }, [state.currentMonth, state.currentYear]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isSending) return;

    const newMsg: ChatMessage = { role: 'user', content: query };
    const updatedHistory = [...chatMessages, newMsg];
    setChatMessages(updatedHistory);
    setInputText('');
    setIsSending(true);

    try {
      const systemPrompt = isAr
        ? `أنت المستشار الاستراتيجي الأول لرئيس الحكومة المغربية. تجيب بدقة وواقعية مبنية على السياق المغربي (المالية العامة، الموارد المائية، التوازنات السياسية والبرلمانية، التماسك الاجتماعي). تحدث بأسلوب رسمي وواضح وموجز.`
        : `You are the Chief Strategic Advisor to the Prime Minister of Morocco. Provide realistic, concise, and politically astute counsel tailored to Moroccan governance, public finance, water security, and parliament.`;

      const responseText = await callDeepSeekChat(
        [
          { role: 'system', content: systemPrompt },
          ...updatedHistory.map(m => ({ role: m.role, content: m.content }))
        ],
        state.deepseekApiKey,
        state.deepseekModel
      );

      setChatMessages([...updatedHistory, { role: 'assistant', content: responseText }]);
    } catch (err: any) {
      const missingKey = err?.message === 'MISSING_API_KEY';
      setChatMessages([
        ...updatedHistory,
        {
          role: 'assistant',
          content: missingKey
            ? (isAr
                ? 'لم يتم ضبط مفتاح DeepSeek API بعد. يمكنك إضافة مفتاحك الخاص من تبويب "الإعدادات" لتفعيل المحادثة التفاعلية، بينما تظل الإحاطة الاستراتيجية المحلية متاحة أعلاه.'
                : 'No DeepSeek API key is configured. Add your own key in Settings to unlock live interactive chat, while the offline executive briefing above remains available.')
            : (isAr
                ? 'نعتذر، حدث خطأ أثناء معالجة الاستشارة. يرجى التحقق من المفتاح والمحاولة.'
                : 'Apologies, an error occurred while processing your request. Please check your API key and try again.')
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickQuestionsAr = [
    'كيف نخفض الاحتقان في الجهات دون مفاقمة عجز الميزانية؟',
    'ما هي أفضل استراتيجية لتأمين إمدادات الماء قبل فصل الصيف؟',
    'كيف نحافظ على تماسك الأغلبية البرلمانية والحكومية؟'
  ];

  const quickQuestionsEn = [
    'How to de-escalate regional tension without widening budget deficit?',
    'What is the best contingency plan for summer water security?',
    'How to reinforce parliamentary coalition stability?'
  ];

  const quickQuestions = isAr ? quickQuestionsAr : quickQuestionsEn;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-4xl h-[90vh] max-h-[850px] shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#162238] to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-800 flex items-center justify-center text-white shadow-lg border border-emerald-400/40">
              <Brain className="w-6 h-6 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  {isAr ? 'المستشار الاستراتيجي لرئيس الحكومة' : 'Chief Strategic AI Advisor'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  deepseek-v4-pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'منظومة استشارية استراتيجية وسيادية لتحليل المؤشرات واتخاذ القرار'
                  : 'Sovereign intelligence engine for policy diagnosis and strategic counsel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center Body: Split between Sovereign Briefing & Interactive Dialogue */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Briefing Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isAr ? 'الإحاطة التشخيصية الدورية للوضع العام للمملكة' : 'Periodic Sovereign Diagnostic Briefing'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isAr ? `شهر ${state.currentMonth} / ${state.currentYear}` : `M${state.currentMonth} / ${state.currentYear}`}
              </span>
            </div>

            {loadingBriefing ? (
              <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
                <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
                <span>{isAr ? 'جاري استخلاص التشخيص وتحليل المؤشرات عبر DeepSeek AI...' : 'Generating sovereign briefing via DeepSeek AI...'}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-normal space-y-2">
                {briefingText}
              </div>
            )}
          </div>

          {/* Quick Questions Carousel */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              {isAr ? 'استشارات استراتيجية مقترحة:' : 'Suggested Strategic Queries:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isSending}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/60 text-xs text-slate-300 hover:text-white transition-all text-start"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat History Section */}
          {chatMessages.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>{isAr ? 'جلسة التشاور المباشرة مع المستشار:' : 'Direct Consultation Session:'}</span>
              </div>

              <div className="space-y-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[85%] rounded-2xl p-4 text-xs space-y-1 ${
                      msg.role === 'user'
                        ? 'ms-auto bg-emerald-700/30 border border-emerald-500/40 text-emerald-100'
                        : 'me-auto bg-slate-800/90 border border-slate-700 text-slate-200 shadow-md'
                    }`}
                  >
                    <span className="text-[10px] font-bold opacity-75">
                      {msg.role === 'user' ? (isAr ? 'رئيس الحكومة' : 'Prime Minister') : (isAr ? 'المستشار الاستراتيجي' : 'Strategic Advisor')}
                    </span>
                    <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>
                ))}

                {isSending && (
                  <div className="me-auto bg-slate-800/90 border border-slate-700 rounded-2xl p-3 flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{isAr ? 'المستشار يصيغ جوابه الاستراتيجي...' : 'Advisor is analyzing your query...'}</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب سؤالك أو استشارتك الاستراتيجية لرئيس الحكومة هنا...'
                  : 'Ask a strategic policy or crisis question to the Prime Minister Advisor...'
              }
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shrink-0"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isAr ? 'استشارة' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
