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

  const handleExport = async () => {
    try {
      setLoading(true);
      const tickets = await storage.getTickets();
      const dataStr = JSON.stringify(tickets);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `tickets_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
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
    <div className="p-6 space-y-8 font-sans h-full bg-neutral-50 relative">
      <div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">数据备份与恢复</h2>
        <p className="text-sm text-neutral-500">
          你的数据存储在本地浏览器中。为了防止数据丢失，建议定期导出备份。
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-400 active:bg-neutral-50 transition-all font-bold text-neutral-800"
        >
          <span className="flex items-center">
            <Download className="w-5 h-5 mr-3 text-neutral-500" />
            导出备份文件 (JSON)
          </span>
        </button>

        <div className="relative">
          <button
            disabled={loading}
            className="w-full flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-400 active:bg-neutral-50 transition-all font-bold text-neutral-800"
          >
            <span className="flex items-center">
               <Upload className="w-5 h-5 mr-3 text-neutral-500" />
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

      <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <div className="text-sm text-orange-800 leading-relaxed">
          <strong>注意：</strong> 导入操作会完全覆盖当前票夹的所有内容，且含有图片的 JSON 文件可能较大，请耐心等待处理完成。
        </div>
      </div>

      {message && (
        <div className="text-center text-sm font-bold p-3 bg-neutral-800 text-white rounded-lg animate-in fade-in zoom-in slide-in-from-bottom-2">
          {message}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showImportConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-2">导入票根数据</h3>
            <p className="text-sm text-neutral-500 mb-6">导入操作会完全覆盖当前票夹的所有内容，确定要继续吗？</p>
            <div className="flex space-x-3">
              <button 
                onClick={cancelImport}
                className="flex-1 py-2.5 rounded-lg font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={confirmImport}
                className="flex-1 py-2.5 rounded-lg font-bold text-white bg-neutral-800 hover:bg-neutral-900 transition-colors"
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
