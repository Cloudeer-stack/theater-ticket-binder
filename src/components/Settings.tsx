import React, { useState } from 'react';
import { storage } from '../lib/storage';
import { Download, Upload, AlertCircle } from 'lucide-react';

interface SettingsProps {
  onDataChanged: () => void;
}

export function Settings({ onDataChanged }: SettingsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingFileContent, setPendingFileContent] = useState<string | null>(null);

  const handleExport = async (includeImages: boolean = true) => {
    try {
      setLoading(true);
      let tickets = await storage.getTickets();
      
      if (!includeImages) {
        tickets = tickets.map(ticket => {
          const { ticketImage, posterImage, ...rest } = ticket;
          return rest;
        });
      }

      const dataStr = JSON.stringify(tickets);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const fileNameSuffix = includeImages ? '' : '_no_images';
      const exportFileDefaultName = `tickets_backup${fileNameSuffix}_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      URL.revokeObjectURL(url);
      setMessage('导出成功！');
    } catch (error) {
      console.error(error);
      setMessage('导出失败');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        try {
          JSON.parse(content);
          setPendingFileContent(content);
          setShowImportConfirm(true);
        } catch (e) {
          setMessage('导入失败：不是有效的票根数据文件');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmImport = async () => {
    if (!pendingFileContent) return;
    setShowImportConfirm(false);
    
    try {
      setLoading(true);
      const data = JSON.parse(pendingFileContent);
      if (Array.isArray(data)) {
        await storage.saveTickets(data);
        onDataChanged();
        setMessage('导入成功！');
      } else {
        setMessage('数据格式错误');
      }
    } catch (error) {
      setMessage('导入失败或文件损坏');
    } finally {
      setLoading(false);
      setPendingFileContent(null);
    }
  };

  const cancelImport = () => {
    setShowImportConfirm(false);
    setPendingFileContent(null);
  };

  return (
    <div className="p-6 space-y-8 font-sans h-full bg-slate-50 relative">
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">数据备份与恢复</h2>
        <p className="text-sm text-slate-500">
          你的数据存储在本地浏览器中。为了防止数据丢失，建议定期导出备份。
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleExport(true)}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/10 active:bg-slate-50 transition-all font-bold text-slate-700"
        >
          <span className="flex items-center">
            <Download className="w-5 h-5 mr-3 text-teal-600" />
            导出备份文件 (完整/含图片)
          </span>
        </button>

        <button
          onClick={() => handleExport(false)}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/10 active:bg-slate-50 transition-all font-bold text-slate-700"
        >
          <span className="flex items-center">
            <Download className="w-5 h-5 mr-3 text-teal-600" />
            导出统计数据 (仅文本/不含图片)
          </span>
        </button>

        <div className="relative">
          <button
            disabled={loading}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/10 active:bg-slate-50 transition-all font-bold text-slate-700"
          >
            <span className="flex items-center">
               <Upload className="w-5 h-5 mr-3 text-teal-600" />
               导入备份数据
            </span>
          </button>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-xl flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <strong>注意：</strong> 导入操作会完全覆盖当前票夹的所有内容，且含有图片的 JSON 文件可能较大，请耐心等待处理完成。
        </div>
      </div>

      {message && (
        <div className="text-center text-sm font-bold p-3 bg-teal-600 text-white rounded-lg animate-in fade-in zoom-in slide-in-from-bottom-2 shadow-lg shadow-teal-500/20">
          {message}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showImportConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-slate-800">导入票根数据</h3>
            <p className="text-sm text-slate-500 mb-6">导入操作会完全覆盖当前票夹的所有内容，确定要继续吗？</p>
            <div className="flex space-x-3">
              <button 
                onClick={cancelImport}
                className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmImport}
                className="flex-1 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-500 transition-colors shadow-lg shadow-teal-500/20"
              >
                确定导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
