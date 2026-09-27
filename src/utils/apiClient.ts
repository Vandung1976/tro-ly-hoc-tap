/**
 * Helper hỗ trợ gửi request tới API server / Vercel Serverless Functions
 * Tự động đính kèm API Key nếu người dùng cấu hình qua Vite env
 */
export function getApiHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const viteKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_API_KEY ||
    (import.meta as any).env?.VITE_API_KEY;

  if (viteKey && typeof viteKey === 'string' && viteKey.trim().length > 5) {
    headers['x-gemini-key'] = viteKey.trim();
  }

  return headers;
}

export interface EnvCheckResult {
  status: 'success' | 'warning';
  geminiApiKeyDetected: boolean;
  maskedKey: string | null;
  isVercel: boolean;
  message: string;
  quickGuide: string[];
}

export async function checkVercelEnv(): Promise<EnvCheckResult | null> {
  try {
    const res = await fetch('/api/env-check', {
      headers: getApiHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Lỗi kiểm tra môi trường Vercel:', err);
  }
  return null;
}
