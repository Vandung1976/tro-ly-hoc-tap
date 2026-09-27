import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatImageAttachment } from '../types/history';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  PenTool,
  CheckSquare,
  GraduationCap,
  ChevronDown,
  Layers,
  Flame,
  ImagePlus,
  Camera,
  X,
  Maximize2,
  ZoomIn,
  UploadCloud,
  FileQuestion,
} from 'lucide-react';

interface TutorChatViewProps {
  onSwitchToQuiz?: () => void;
  onSwitchToEssay?: () => void;
}

interface SelectedImageState {
  url: string;
  base64Data: string;
  mimeType: string;
  name: string;
  sizeFormatted?: string;
}

export const TutorChatView: React.FC<TutorChatViewProps> = ({
  onSwitchToQuiz,
  onSwitchToEssay,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('history_tutor_chat_messages_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        content: `👋 **Xin chào bạn! Tớ là trợ lý của Thầy Dũng, bạn cần giúp gì mình sẵn lòng đồng hành cùng bạn ôn tập Lịch sử nhé.**

Tớ hoạt động với tư duy và phương pháp của một giáo viên Lịch sử THPT giàu kinh nghiệm, đồng hành cùng bạn chinh phục kỳ thi tốt nghiệp THPT và các bài kiểm tra:

📌 **2 NGUYÊN TẮC SỬ DỤNG TÀI LIỆU & ÔN TẬP:**
* 🎯 **Nguyên tắc 1: Ưu tiên tuyệt đối nguồn tài liệu được cung cấp:**
  - Bám sát 100% nội dung tài liệu nguồn và Sách giáo khoa Lịch sử 12 mới (bộ Kết nối tri thức với cuộc sống).
  - Không tự ý thay đổi nội dung, không bịa đặt sự kiện, số liệu hay nhận định ngoài tài liệu. Nếu tài liệu chưa đủ thông tin, tớ sẽ thông báo rõ: *“Nội dung này chưa được cung cấp đầy đủ trong tài liệu nguồn.”*
* 🧠 **Nguyên tắc 2: Không học thuộc máy móc:**
  - Giúp bạn trả lời trọn vẹn 10 câu hỏi tư duy cốt lõi: *Chuyện gì xảy ra? Khi nào? Ở đâu? Vì sao xảy ra? Diễn biến chính? Kết quả? Ý nghĩa? Tác động? Quan hệ trước - sau? Bài học rút ra là gì?*
* 🎯 **Luyện tập toàn diện 3 dạng bài thi:**
  - *Trắc nghiệm nhiều lựa chọn (A, B, C, D)* kèm phân tích bẫy phương án sai.
  - *Trắc nghiệm Đúng - Sai theo đoạn trích tư liệu lịch sử* chuẩn định dạng thi mới.
  - *Câu hỏi Tự luận* có dàn ý, luận điểm và barem chấm điểm chi tiết.
* 📊 **Phân hóa 3 mức độ:** Nhận biết 🟢 – Thông hiểu 🟡 – Vận dụng 🔴.
* 📸 **Giải đề qua ảnh chụp:** Bạn có thể bấm nút **Tải ảnh đề** hoặc nhấn \`Ctrl + V\` để dán ảnh chụp đề thi nhé!

Hôm nay bạn muốn củng cố chủ đề nào hay cần giải câu hỏi nào? Hãy nhắn cho tớ nhé!`,
        timestamp: 'Vừa xong',
      },
    ];
  });

  const [input, setInput] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<SelectedImageState | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Action Buttons matching the teacher mindset, 3-9 modules & new exam format
  const quickActions = [
    {
      label: 'Tải ảnh đề thi để giải',
      icon: <Camera className="w-3.5 h-3.5 text-rose-600" />,
      actionType: 'upload_image',
    },
    {
      label: 'Ôn cho em bài này (Cấu trúc A-F)',
      icon: <BookOpen className="w-3.5 h-3.5 text-emerald-600" />,
      prompt: 'Ôn cho em bài Hội nghị I-an-ta và sự hình thành Trật tự hai cực (theo đầy đủ cấu trúc 6 phần: Kiến thức cốt lõi, Từ khóa lịch sử, Quan hệ nhân - quả, Bảng so sánh, Điểm dễ nhầm và Sơ đồ tư duy).',
    },
    {
      label: 'Luyện trắc nghiệm (ẩn đáp án)',
      icon: <CheckSquare className="w-3.5 h-3.5 text-amber-600" />,
      prompt: 'Hãy tạo cho tớ 3 câu hỏi trắc nghiệm nhiều lựa chọn (A, B, C, D) phân loại theo 3 mức độ: Nhận biết, Thông hiểu và Vận dụng. Nhớ đừng tiết lộ đáp án ngay để tớ làm bài trước nhé!',
    },
    {
      label: 'Trắc nghiệm Đúng / Sai dạng tư liệu',
      icon: <HelpCircle className="w-3.5 h-3.5 text-blue-600" />,
      prompt: 'Hãy tạo cho tớ 1 câu trắc nghiệm Đúng - Sai kèm đoạn trích tư liệu lịch sử (gồm 4 nhận định a, b, c, d từ dễ đến khó) chuẩn định dạng thi tốt nghiệp THPT từ năm 2025.',
    },
    {
      label: 'Luyện tự luận (ra đề để em làm)',
      icon: <Layers className="w-3.5 h-3.5 text-purple-600" />,
      prompt: 'Hãy ra cho tớ 1 đề tự luận Lịch sử 12 rèn luyện tư duy phân tích mối quan hệ nhân quả hoặc so sánh. Đừng đưa đáp án ngay để tớ tự làm trước, sau đó chấm bài cho tớ nhé!',
    },
    {
      label: 'Kiểm tra em đi',
      icon: <Flame className="w-3.5 h-3.5 text-orange-600" />,
      prompt: 'Kiểm tra em đi! Hãy tạo một bài kiểm tra nhanh gồm 4 câu trắc nghiệm bao quát các chủ đề trọng tâm để em làm bài.',
    },
    {
      label: 'Em hay nhầm phần này (Bảng so sánh)',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />,
      prompt: 'Em hay nhầm giữa Chiến tranh đặc biệt (1961 - 1965) và Chiến tranh cục bộ (1965 - 1968). Hãy lập bảng so sánh và chỉ ra các điểm dễ nhầm lẫn, sau đó cho em 1 bài luyện ngắn nhé!',
    },
  ];

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('history_tutor_chat_messages_v1', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isSending]);

  // Adjust textarea height automatically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  // Process image file with smart client-side optimization
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)!');
      return;
    }

    setIsProcessingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize if too huge while maintaining sharp text OCR
          const MAX_DIM = 1600;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            const rawUrl = e.target?.result as string;
            const base64Data = rawUrl.split(',')[1];
            setSelectedImage({
              url: rawUrl,
              base64Data,
              mimeType: file.type || 'image/jpeg',
              name: file.name,
              sizeFormatted: `${(file.size / 1024).toFixed(0)} KB`,
            });
            setIsProcessingImage(false);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const resizedDataUrl = canvas.toDataURL(mime, 0.88);
          const base64Data = resizedDataUrl.split(',')[1];

          setSelectedImage({
            url: resizedDataUrl,
            base64Data,
            mimeType: mime,
            name: file.name,
            sizeFormatted: `${(file.size / 1024).toFixed(0)} KB`,
          });
          setIsProcessingImage(false);
          // Focus input
          textareaRef.current?.focus();
        };

        img.onerror = () => {
          alert('Không thể mở hình ảnh này. Vui lòng thử lại ảnh khác.');
          setIsProcessingImage(false);
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        alert('Lỗi khi đọc file ảnh.');
        setIsProcessingImage(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsProcessingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input value so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  // Clipboard paste support (Ctrl + V with screenshot)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  };

  const handleSend = async (textToSend?: string) => {
    const questionText = textToSend !== undefined ? textToSend : input;
    const hasText = Boolean(questionText.trim());
    const hasImg = Boolean(selectedImage);

    if ((!hasText && !hasImg) || isSending) return;

    const currentImg = selectedImage;

    // Build user message
    const userMsgContent = hasText
      ? questionText.trim()
      : '📸 Phân tích và giải chi tiết đề thi lịch sử trong bức ảnh này giúp em.';

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: userMsgContent,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      image: currentImg
        ? {
            url: currentImg.url,
            name: currentImg.name,
            mimeType: currentImg.mimeType,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgContent,
          question: userMsgContent,
          prompt: userMsgContent,
          history: messages.slice(-6).map((m) => ({
            role: m.sender,
            content: m.content,
          })),
          image: currentImg
            ? {
                data: currentImg.base64Data,
                mimeType: currentImg.mimeType,
                name: currentImg.name,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      const answerText = data.answer || data.reply || data.text || data.message;
      if (answerText) {
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: 'assistant',
          content: answerText,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          content: 'Xin lỗi bạn, trợ lý gặp gián đoạn tạm thời khi xử lý. Bạn vui lòng bấm gửi lại câu hỏi hoặc tải lại ảnh nhé!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng và thử lại.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa lịch sử trò chuyện và bắt đầu phiên hỏi đáp mới?')) {
      const initial: ChatMessage[] = [
        {
          id: `welcome-${Date.now()}`,
          sender: 'assistant',
          content: `Tớ đã làm mới cuộc trò chuyện rồi nè! Tớ là trợ lý của Thầy Dũng, bạn cần giúp gì mình sẵn lòng giải đáp câu hỏi, chấm bài tự luận hoặc giải đề thi Lịch sử cho bạn nhé.`,
          timestamp: 'Vừa xong',
        },
      ];
      setMessages(initial);
      localStorage.setItem('history_tutor_chat_messages_v1', JSON.stringify(initial));
    }
  };

  // Helper function to render formatted text with basic Markdown features, tables, code blocks, and rich badge accents
  const renderFormattedContent = (content: string) => {
    const rawLines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < rawLines.length) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // 1. Code blocks (e.g. Sơ đồ tư duy)
      if (trimmed.startsWith('```')) {
        const codeLines: string[] = [];
        i++;
        while (i < rawLines.length && !rawLines[i].trim().startsWith('```')) {
          codeLines.push(rawLines[i]);
          i++;
        }
        i++; // skip closing ```
        elements.push(
          <div key={`code-${i}`} className="my-3 rounded-2xl overflow-hidden border border-amber-300/80 shadow-md">
            <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 px-3.5 py-1.5 flex items-center justify-between text-xs text-amber-300 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-1 text-white font-semibold">Sơ đồ tư duy / Trực quan hóa</span>
              </span>
              <span className="text-[11px] text-amber-300/80">Lịch sử THPT</span>
            </div>
            <pre className="bg-stone-950 text-amber-200/90 p-4 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto whitespace-pre">
              {codeLines.join('\n')}
            </pre>
          </div>
        );
        continue;
      }

      // 2. Table parsing (Markdown tables starting with |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
          tableLines.push(rawLines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const parseRow = (rowStr: string) =>
            rowStr
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim());

          const headerCols = parseRow(tableLines[0]);
          const bodyRows = tableLines.slice(1).filter((r) => !r.includes('---'));

          elements.push(
            <div key={`table-${i}`} className="my-4 overflow-x-auto rounded-2xl border-2 border-amber-200/90 shadow-md shadow-amber-900/5">
              <table className="w-full text-xs sm:text-sm text-left border-collapse bg-white">
                <thead className="bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 text-red-950 font-bold border-b-2 border-amber-300">
                  <tr>
                    {headerCols.map((col, cIdx) => (
                      <th key={cIdx} className="px-3.5 py-2.5 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                        {renderInlineStyles(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {bodyRows.map((rowStr, rIdx) => {
                    const cols = parseRow(rowStr);
                    const isEven = rIdx % 2 === 0;
                    return (
                      <tr key={rIdx} className={isEven ? 'bg-white hover:bg-amber-50/50' : 'bg-amber-50/30 hover:bg-amber-50/60'}>
                        {cols.map((col, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2.5 text-stone-800 leading-relaxed font-normal align-top">
                            {renderInlineStyles(col)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // 3. Section Headers with vibrant highlight accents
      if (trimmed.startsWith('### ')) {
        const titleText = trimmed.slice(4);
        const isCore = titleText.includes('A. KIẾN THỨC CỐT LÕI') || titleText.includes('CỐT LÕI');
        const isKeywords = titleText.includes('B. TỪ KHÓA LỊCH SỬ') || titleText.includes('TỪ KHÓA');
        const isCauseEffect = titleText.includes('C. QUAN HỆ NGUYÊN NHÂN') || titleText.includes('NGUYÊN NHÂN');
        const isComparison = titleText.includes('D. SO SÁNH') || titleText.includes('SO SÁNH');
        const isMistakes = titleText.includes('E. NHỮNG ĐIỂM DỄ NHẦM') || titleText.includes('DỄ NHẦM') || titleText.includes('BẪY');
        const isMindmap = titleText.includes('F. SƠ ĐỒ TƯ DUY') || titleText.includes('SƠ ĐỒ');
        const isBonus = titleText.includes('💡') || titleText.includes('Kiến thức mở rộng');

        let borderAndBg = 'border-l-4 border-amber-600 bg-gradient-to-r from-amber-50/90 to-transparent text-amber-950';
        if (isCore) borderAndBg = 'border-l-4 border-red-600 bg-gradient-to-r from-red-50 to-transparent text-red-950';
        else if (isKeywords) borderAndBg = 'border-l-4 border-emerald-600 bg-gradient-to-r from-emerald-50 to-transparent text-emerald-950';
        else if (isCauseEffect) borderAndBg = 'border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-transparent text-blue-950';
        else if (isComparison) borderAndBg = 'border-l-4 border-purple-600 bg-gradient-to-r from-purple-50 to-transparent text-purple-950';
        else if (isMistakes) borderAndBg = 'border-l-4 border-rose-600 bg-gradient-to-r from-rose-50 to-transparent text-rose-950';
        else if (isMindmap) borderAndBg = 'border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-transparent text-indigo-950';
        else if (isBonus) borderAndBg = 'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-transparent text-yellow-950';

        elements.push(
          <div key={`h3-${i}`} className={`mt-5 mb-2 pl-3 py-1.5 rounded-r-xl ${borderAndBg}`}>
            <h4 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 inline shrink-0" />
              <span>{renderInlineStyles(titleText)}</span>
            </h4>
          </div>
        );
        i++;
        continue;
      }

      // Header 2
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h2-${i}`} className="font-extrabold text-base sm:text-lg mt-5 mb-2 text-red-950 border-b-2 border-amber-200 pb-1.5 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <span>{renderInlineStyles(trimmed.slice(3))}</span>
          </h3>
        );
        i++;
        continue;
      }

      // Header 1
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2 key={`h1-${i}`} className="font-black text-lg sm:text-xl mt-5 mb-2 text-stone-900">
            {renderInlineStyles(trimmed.slice(2))}
          </h2>
        );
        i++;
        continue;
      }

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***') {
        elements.push(<hr key={`hr-${i}`} className="my-3 border-amber-200/80" />);
        i++;
        continue;
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2 pl-1.5 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-2" />
            <div className="flex-1 text-stone-800 leading-relaxed font-normal">
              {renderInlineStyles(trimmed.slice(2))}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // Numbered list
      const matchNum = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (matchNum) {
        elements.push(
          <div key={`num-${i}`} className="flex items-start gap-2.5 pl-1 py-1">
            <span className="font-black text-white bg-gradient-to-tr from-red-600 to-amber-600 rounded-md text-[11px] w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              {matchNum[1]}
            </span>
            <div className="flex-1 text-stone-800 leading-relaxed">
              {renderInlineStyles(matchNum[2])}
            </div>
          </div>
        );
        i++;
        continue;
      }

      // Empty line
      if (trimmed === '') {
        elements.push(<div key={`sp-${i}`} className="h-1" />);
        i++;
        continue;
      }

      // Standard paragraph
      elements.push(
        <p key={`p-${i}`} className="text-stone-800 leading-relaxed">
          {renderInlineStyles(line)}
        </p>
      );
      i++;
    }

    return (
      <div className="space-y-1.5 font-sans text-[13px] sm:text-[14px] leading-relaxed">
        {elements}
      </div>
    );
  };

  // Helper for inline markdown: **bold**, *italic*, `code`, and special badges
  const renderInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        // Highlight keyword tags with distinct colors
        if (inner.includes('Thời gian') || inner.includes('📌')) {
          return (
            <span key={i} className="font-bold text-amber-950 bg-amber-100/90 px-1.5 py-0.5 rounded-md border border-amber-300/80 mr-1 inline-flex items-center gap-1 shadow-2xs">
              {inner}
            </span>
          );
        }
        if (inner.includes('Địa điểm') || inner.includes('📍')) {
          return (
            <span key={i} className="font-bold text-sky-950 bg-sky-100/90 px-1.5 py-0.5 rounded-md border border-sky-300/80 mr-1 inline-flex items-center gap-1 shadow-2xs">
              {inner}
            </span>
          );
        }
        if (inner.includes('Bối cảnh') || inner.includes('Mục tiêu') || inner.includes('🎯')) {
          return (
            <span key={i} className="font-bold text-emerald-950 bg-emerald-100/90 px-1.5 py-0.5 rounded-md border border-emerald-300/80 mr-1 inline-flex items-center gap-1 shadow-2xs">
              {inner}
            </span>
          );
        }
        if (inner.includes('Nhân vật') || inner.includes('Lực lượng') || inner.includes('👥')) {
          return (
            <span key={i} className="font-bold text-purple-950 bg-purple-100/90 px-1.5 py-0.5 rounded-md border border-purple-300/80 mr-1 inline-flex items-center gap-1 shadow-2xs">
              {inner}
            </span>
          );
        }
        if (inner.includes('Diễn biến') || inner.includes('⚡')) {
          return (
            <span key={i} className="font-bold text-orange-950 bg-orange-100/90 px-1.5 py-0.5 rounded-md border border-orange-300/80 mr-1 inline-flex items-center gap-1 shadow-2xs">
              {inner}
            </span>
          );
        }
        if (inner.includes('Kết quả') || inner.includes('🏆')) {
          return (
            <span key={i} className="font-bold text-yellow-950 bg-yellow-100/90 px-1.5 py-0.5 rounded-md border border-yellow-300/80 mr-1 inline-flex items-center gap-1 shadow-2xs">
              {inner}
            </span>
          );
        }
        if (inner.includes('Ý nghĩa') || inner.includes('Tác động') || inner.includes('🌟')) {
          return (
            <span key={i} className="font-bold text-rose-950 bg-rose-100/90 px-1.5 py-0.5 rounded-md border border-rose-300/80 mr-1 inline-flex items-center gap-1 shadow-2xs">
              {inner}
            </span>
          );
        }
        if (inner.includes('bẫy') || inner.includes('Nhầm lẫn') || inner.includes('⚠️')) {
          return (
            <span key={i} className="font-bold text-red-950 bg-red-100/90 px-1.5 py-0.5 rounded-md border border-red-300 mr-1 inline-flex items-center gap-1 shadow-2xs">
              {inner}
            </span>
          );
        }

        return (
          <strong key={i} className="font-bold text-stone-950 bg-amber-100/70 px-1 py-0.5 rounded border border-amber-200/60">
            {inner}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-stone-700 font-medium">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="font-mono text-xs bg-amber-50 text-red-800 px-1.5 py-0.5 rounded border border-amber-300 font-bold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[580px] max-h-[840px] bg-white rounded-2xl border transition-all shadow-sm overflow-hidden relative ${
        isDragging ? 'border-amber-500 ring-4 ring-amber-500/20' : 'border-stone-200'
      }`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-amber-900/40 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 text-center text-white pointer-events-none">
          <div className="p-4 rounded-full bg-white/20 mb-3 animate-bounce">
            <UploadCloud className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg font-bold">Thả ảnh đề thi Lịch sử vào đây</p>
          <p className="text-xs text-amber-100 mt-1">Trợ lý sẽ tự động trích xuất câu hỏi và giải chi tiết</p>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-stone-900 rounded-2xl overflow-hidden p-2 flex flex-col items-center">
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-all shadow-lg z-10"
              title="Đóng xem ảnh"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImg}
              alt="Ảnh đề bài phóng to"
              className="max-h-[82vh] w-auto object-contain rounded-lg"
            />
            <p className="text-xs text-stone-300 mt-2">Ảnh đề bài Lịch sử (Nhấn bất kỳ đâu để đóng)</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-amber-200/70 flex items-center justify-between bg-gradient-to-r from-amber-50/90 via-white to-red-50/50 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-900/20">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-stone-900 font-serif">
                Trợ lý của Thầy Dũng
              </h2>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-red-100 text-amber-950 border border-amber-300 shadow-2xs">
                SGK Lịch sử 12 Kết nối tri thức 📚
              </span>
              <span className="hidden md:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/80 shadow-2xs">
                Giải đề & Ôn thi 📸
              </span>
            </div>
            <p className="text-xs text-stone-600 truncate max-w-[280px] sm:max-w-none">
              Tớ là trợ lý của Thầy Dũng, bạn cần giúp gì mình sẵn lòng đồng hành cùng bạn!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick upload trigger in header */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isProcessingImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 text-red-800 text-xs font-bold transition-all border border-red-300 shadow-xs"
            title="Tải ảnh chụp đề bài để giải ngay"
          >
            <Camera className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Tải ảnh đề</span>
          </button>

          {onSwitchToQuiz && (
            <button
              onClick={onSwitchToQuiz}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300/80 hover:bg-amber-50 text-amber-900 text-xs font-semibold transition-all shadow-2xs"
              title="Làm đề trắc nghiệm tính điểm"
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Thi thử</span>
            </button>
          )}

          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 text-xs font-medium transition-all"
            title="Xóa lịch sử và bắt đầu phiên mới"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hội thoại mới</span>
          </button>
        </div>
      </div>

      {/* Quick Prompts Carousel with vibrant, colorful tags */}
      <div className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-stone-50 via-amber-50/40 to-stone-50 border-b border-amber-200/60 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold text-red-900 shrink-0 flex items-center gap-1 pl-1">
          <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
          Gợi ý nhanh:
        </span>
        {quickActions.map((action, idx) => {
          // Palette rotation for distinct eye-catching visual accents
          const pillColors = [
            'bg-rose-50/90 hover:bg-rose-100 border-rose-300 text-rose-900',
            'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-300 text-emerald-900',
            'bg-amber-50/90 hover:bg-amber-100 border-amber-300 text-amber-950',
            'bg-sky-50/90 hover:bg-sky-100 border-sky-300 text-sky-900',
            'bg-purple-50/90 hover:bg-purple-100 border-purple-300 text-purple-900',
            'bg-orange-50/90 hover:bg-orange-100 border-orange-300 text-orange-950',
            'bg-indigo-50/90 hover:bg-indigo-100 border-indigo-300 text-indigo-900',
          ];
          const colorClass = pillColors[idx % pillColors.length];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (action.actionType === 'upload_image') {
                  fileInputRef.current?.click();
                } else if (action.prompt) {
                  handleSend(action.prompt);
                }
              }}
              disabled={isSending || isProcessingImage}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full border whitespace-nowrap transition-all shrink-0 shadow-2xs font-semibold disabled:opacity-50 hover:scale-102 ${colorClass}`}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-amber-50/20 via-white to-stone-50/30">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 sm:gap-3.5 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              } transition-opacity duration-200`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-tr from-stone-800 to-stone-700 text-white'
                    : 'bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 text-white shadow-red-900/15'
                }`}
              >
                {isUser ? <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
              </div>

              {/* Chat Bubble Container */}
              <div
                className={`flex flex-col max-w-[90%] sm:max-w-[80%] ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                {/* User Image Attachment */}
                {isUser && m.image && (
                  <div className="mb-2 max-w-xs sm:max-w-sm rounded-xl overflow-hidden border-2 border-amber-400 shadow-md group relative bg-stone-900">
                    <img
                      src={m.image.url}
                      alt={m.image.name || 'Ảnh đề bài'}
                      onClick={() => setPreviewModalImg(m.image!.url)}
                      className="w-full max-h-56 object-contain bg-stone-950/40 cursor-zoom-in group-hover:opacity-90 transition-all"
                    />
                    <div
                      onClick={() => setPreviewModalImg(m.image!.url)}
                      className="px-2.5 py-1.5 bg-stone-900/90 text-white text-[11px] flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate max-w-[180px] font-medium flex items-center gap-1">
                        <Camera className="w-3 h-3 text-amber-400" />
                        {m.image.name || 'Ảnh đề thi lịch sử'}
                      </span>
                      <span className="text-[10px] text-amber-300 flex items-center gap-0.5">
                        <ZoomIn className="w-3 h-3" /> Phóng to
                      </span>
                    </div>
                  </div>
                )}

                {/* Bubble Text */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 text-stone-800 leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-br from-red-600 via-red-700 to-amber-700 text-white rounded-tr-xs font-normal shadow-md shadow-red-700/20'
                      : 'bg-white border border-amber-200/80 rounded-tl-xs shadow-xs'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-line text-sm sm:text-[14px] leading-relaxed text-white font-medium">
                      {m.content}
                    </div>
                  ) : (
                    <div>{renderFormattedContent(m.content)}</div>
                  )}
                </div>

                {/* Meta info & actions */}
                <div
                  className={`flex items-center gap-2 mt-1.5 px-1 text-[11px] text-stone-400 ${
                    isUser ? 'justify-end' : 'justify-between w-full'
                  }`}
                >
                  <span className="text-[10px] text-stone-400">{m.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCopy(m.content, m.id)}
                        className="flex items-center gap-1 text-stone-500 hover:text-red-700 transition-colors"
                        title="Sao chép câu trả lời"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Đã sao chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isSending && (
          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-900/15">
              <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="bg-white border border-amber-200 rounded-2xl rounded-tl-xs p-4 shadow-xs max-w-sm">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-700 font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-bounce" />
                </div>
                <span className="text-stone-700 font-semibold">Trợ lý đang đọc đề & hệ thống hóa bài giải...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview Strip (Above Input Box) */}
      {selectedImage && (
        <div className="px-3 sm:px-4 py-2.5 bg-amber-50/90 border-t border-amber-200/80 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              onClick={() => setPreviewModalImg(selectedImage.url)}
              className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-300 shrink-0 bg-stone-900 cursor-pointer hover:opacity-90 transition-opacity group"
              title="Nhấn để xem to ảnh"
            >
              <img
                src={selectedImage.url}
                alt="Xem trước ảnh đề"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-600 text-white uppercase tracking-wider">
                  Ảnh đề bài
                </span>
                <span className="text-xs font-semibold text-stone-800 truncate max-w-[200px] sm:max-w-xs">
                  {selectedImage.name}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                <span>{selectedImage.sizeFormatted}</span>
                <span>• Sẵn sàng gửi kèm yêu cầu</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleSend('Hãy đọc kỹ ảnh đề bài này, giải chi tiết từng câu và chỉ rõ đáp án đúng kèm mẹo thi giúp em.')}
              disabled={isSending}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white transition-all shadow-sm shadow-red-600/20"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>Giải ngay đề này</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1.5 rounded-lg hover:bg-red-100 text-stone-600 hover:text-red-700 transition-colors"
              title="Hủy chọn ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Box Fixed at the Bottom (ChatGPT Style with Image Upload) */}
      <div className="p-3 sm:p-4 border-t border-amber-200/80 bg-white/98 backdrop-blur-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex flex-col gap-2"
        >
          <div className="relative flex items-end gap-2 bg-stone-50/80 hover:bg-stone-50 focus-within:bg-white rounded-2xl border border-stone-300 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/15 transition-all p-1.5 sm:p-2 shadow-2xs">
            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isProcessingImage}
              className="shrink-0 p-2 sm:p-2.5 rounded-xl text-stone-500 hover:text-red-700 hover:bg-red-50 transition-all disabled:opacity-40"
              title="Tải ảnh chụp đề bài từ máy tính hoặc điện thoại (Hỗ trợ dán Ctrl+V)"
            >
              <ImagePlus className="w-5 h-5" />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                selectedImage
                  ? 'Nhập yêu cầu thêm về ảnh (hoặc bấm nút gửi để giải ngay đề)...'
                  : 'Nhập câu hỏi, kéo thả ảnh đề bài, hoặc dán ảnh (Ctrl+V)...'
              }
              disabled={isSending}
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none resize-none max-h-36 leading-relaxed"
            />

            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isSending || isProcessingImage}
              className="shrink-0 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-red-600 via-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-red-600/25 active:scale-95"
              title="Gửi câu hỏi / đề thi (Nhấn Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between px-2 text-[11px] text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline">Mẹo: Bấm 📷 tải ảnh đề thi hoặc</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600 font-mono text-[10px]">
                Ctrl + V
              </kbd>
              <span className="hidden sm:inline">để dán ảnh; nhấn</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-600 font-mono text-[10px]">
                Enter
              </kbd>
              <span className="hidden sm:inline">để gửi.</span>
              <span className="sm:hidden">Chạm 📷 để tải ảnh chụp đề bài.</span>
            </div>

            <span className="text-stone-400 font-medium">
              OCR & Khảo thí Lịch sử GDPT
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
