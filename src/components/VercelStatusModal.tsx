import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, ShieldCheck, HelpCircle, Copy, Check } from 'lucide-react';
import { checkVercelEnv, EnvCheckResult } from '../utils/apiClient';

interface VercelStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelStatusModal: React.FC<VercelStatusModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<EnvCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    const result = await checkVercelEnv();
    setData(result);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyVarName = () => {
    navigator.clipboard.writeText('GEMINI_API_KEY');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Trạng thái Môi trường & AI (Vercel)</h3>
              <p className="text-xs text-stone-300">Chẩn đoán và hướng dẫn kích hoạt GEMINI_API_KEY</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-stone-700 text-sm">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              data?.geminiApiKeyDetected
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/90 border-amber-300/80 text-amber-950'
            }`}
          >
            {data?.geminiApiKeyDetected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">
                  {data?.geminiApiKeyDetected
                    ? 'GEMINI_API_KEY đã kết nối thành công!'
                    : 'Chưa nhận diện được GEMINI_API_KEY trên Vercel'}
                </span>
                <button
                  onClick={fetchStatus}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 bg-white/80 hover:bg-white px-2 py-1 rounded-lg border border-stone-200 transition-all cursor-pointer"
                  title="Kiểm tra lại"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Làm mới</span>
                </button>
              </div>

              {data?.geminiApiKeyDetected ? (
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Hệ thống đang hoạt động với đầy đủ năng lực của mô hình Gemini AI trực tuyến (giải đề ảnh OCR, ra đề thi cá nhân hóa, chấm bài tự luận).
                  {data.maskedKey && <span className="block mt-1 font-mono text-[11px] text-emerald-700">Mã: {data.maskedKey}</span>}
                </p>
              ) : (
                <p className="text-xs text-amber-800 leading-relaxed">
                  Hệ thống đang chạy chế độ <strong>Kho dữ liệu Sử 12 tích hợp sẵn</strong>. Hãy làm theo hướng dẫn 4 bước bên dưới để kích hoạt AI trực tuyến.
                </p>
              )}
            </div>
          </div>

          {/* Guide Steps */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-red-600" />
              <span>4 Bước khắc phục để Vercel nhận diện GEMINI_API_KEY</span>
            </h4>

            <div className="space-y-2.5">
              {/* Step 1 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                  <span className="font-semibold text-stone-900 text-xs">Lấy API Key miễn phí từ Google</span>
                </div>
                <p className="text-xs text-stone-600 pl-7">
                  Truy cập{' '}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-700 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  để lấy Gemini API Key (bắt đầu bằng chuỗi <code>AIzaSy...</code>).
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                  <span className="font-semibold text-stone-900 text-xs">Vào Vercel Settings ➔ Environment Variables</span>
                </div>
                <div className="pl-7 space-y-1 text-xs text-stone-600">
                  <p>Mở trang quản trị dự án trên Vercel Dashboard ➔ vào tab <strong>Settings</strong> ➔ chọn <strong>Environment Variables</strong>.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-stone-500 font-mono">Tên biến:</span>
                    <code className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-900 font-mono font-bold text-xs">
                      GEMINI_API_KEY
                    </code>
                    <button
                      onClick={handleCopyVarName}
                      className="text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Sao chép tên biến"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="pt-1">Dán API Key của bạn vào ô <strong>Value</strong>.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                  <span className="font-semibold text-stone-900 text-xs">Tích chọn cả 3 Môi trường (Environments)</span>
                </div>
                <p className="text-xs text-stone-600 pl-7">
                  Đảm bảo đã tích chọn đủ 3 ô: <strong className="text-stone-800">Production</strong>, <strong className="text-stone-800">Preview</strong>, và <strong className="text-stone-800">Development</strong> ➔ Bấm <strong>Save</strong>.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                  <span className="font-semibold text-amber-950 text-xs">BẮT BUỘC REDEPLOY (Bước then chốt!)</span>
                </div>
                <p className="text-xs text-amber-900 pl-7 leading-relaxed">
                  Vercel <strong>không tự động cập nhật biến mới</strong> vào bản deploy đang chạy. Bạn hãy chuyển sang tab <strong className="text-amber-950">Deployments</strong> ➔ bấm vào nút <strong className="text-amber-950"><code>...</code> (3 chấm)</strong> ở bản deploy mới nhất ➔ chọn <strong className="text-amber-950">Redeploy</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[11px] text-stone-500">
            Endpoint chẩn đoán: <code className="text-stone-700">/api/env-check</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};
