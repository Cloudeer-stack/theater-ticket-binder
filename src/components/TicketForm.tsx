import React, { useState, useRef } from 'react';
import { Ticket, Category } from '../types';
import { compressImage } from '../lib/utils';
import { X, Image as ImageIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface TicketFormProps {
  initialData?: Ticket;
  onSave: (ticket: Ticket) => void;
  onCancel: () => void;
}

const PRESET_TAGS = ['二刷', '喜欢', '哭了', '踩雷', '神仙卡司', '舞美震撼'];

export function TicketForm({ initialData, onSave, onCancel }: TicketFormProps) {
  const [formData, setFormData] = useState<Partial<Ticket>>(
    initialData || {
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '19:30',
      venue: '',
      seat: '',
      price: '',
      category: '音乐剧',
      review: '',
      cast: '',
      tags: [],
    }
  );

  const [tagInput, setTagInput] = useState('');
  const [errorObj, setErrorObj] = useState<string | null>(null);

  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    if (!formData.tags?.includes(tag.trim())) {
      setFormData({ ...formData, tags: [...(formData.tags || []), tag.trim()] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tagToRemove)
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'ticketImage' | 'posterImage') => {
    const file = e.target.files?.[0];
    if (file) {
       try {
         // Compress image to a max width of 800px and 70% quality to save space
         const base64 = await compressImage(file, 800, 0.7);
         setFormData({ ...formData, [field]: base64 });
       } catch (error) {
         console.error('Image upload failed', error);
         setErrorObj('图片处理失败，请重试');
       }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      setErrorObj('请填写剧名和日期');
      return;
    }
    
    // Auto add tag if input is not empty
    let finalTags = formData.tags || [];
    if (tagInput.trim()) {
      if (!finalTags.includes(tagInput.trim())) {
        finalTags = [...finalTags, tagInput.trim()];
      }
    }

    const ticket: Ticket = {
      ...formData,
      id: initialData?.id || Date.now().toString() + Math.random().toString(36).substring(7),
      title: formData.title!,
      date: formData.date!,
      category: formData.category as Category,
      tags: finalTags,
      review: formData.review || '',
      venue: formData.venue || '',
      seat: formData.seat || '',
      price: formData.price || '',
      cast: formData.cast || '',
      createdAt: initialData?.createdAt || Date.now(),
    };

    onSave(ticket);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6 pb-24 font-sans text-neutral-800">
      
      {errorObj && (
        <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {errorObj}
        </div>
      )}

      {/* Category Selection */}
      <div className="flex space-x-2">
        {['音乐剧', '话剧', '舞剧', '其他'].map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setFormData({ ...formData, category: cat as Category })}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
              formData.category === cat 
                ? 'bg-neutral-900 border-neutral-900 text-white' 
                : 'bg-white border-neutral-200 text-neutral-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">剧目名称 *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 transition-all font-bold text-lg"
            placeholder="如：剧院魅影"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">演出日期 *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-neutral-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">时间</label>
            <input
              type="time"
              value={formData.time || ''}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-neutral-400 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">场馆</label>
            <input
              type="text"
              value={formData.venue}
              onChange={e => setFormData({ ...formData, venue: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-neutral-400 transition-all"
              placeholder="如：上海大剧院"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">座位</label>
            <input
              type="text"
              value={formData.seat}
              onChange={e => setFormData({ ...formData, seat: e.target.value })}
              className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-neutral-400 transition-all"
              placeholder="如：1楼A区1排1座"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">票价</label>
          <input
            type="text"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
            className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-neutral-400 transition-all"
            placeholder="如：480"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">演员卡司</label>
          <textarea
            value={formData.cast}
            onChange={e => setFormData({ ...formData, cast: e.target.value })}
            className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-neutral-400 transition-all resize-none h-20"
            placeholder="记录今天的卡司阵容..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">观后感</label>
          <textarea
            value={formData.review}
            onChange={e => setFormData({ ...formData, review: e.target.value })}
            className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2 outline-none focus:border-neutral-400 transition-all resize-none h-32"
            placeholder="记录一下此时的心情..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">图片上传 (海报 / 票根)</label>
          <div className="grid grid-cols-2 gap-4">
            
            {/* Poster Upload */}
            <div className="relative border-2 border-dashed border-neutral-200 rounded-xl overflow-hidden aspect-[3/4] group bg-white">
              {formData.posterImage ? (
                <>
                  <img src={formData.posterImage} alt="Poster" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, posterImage: undefined })}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 group-hover:text-neutral-500 transition-colors">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-medium">上传海报</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'posterImage')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Ticket Image Upload */}
            <div className="relative border-2 border-dashed border-neutral-200 rounded-xl overflow-hidden aspect-[3/4] group bg-white">
              {formData.ticketImage ? (
                <>
                  <img src={formData.ticketImage} alt="Ticket" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, ticketImage: undefined })}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 group-hover:text-neutral-500 transition-colors">
                  <Upload className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-xs font-medium">上传票根照片</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'ticketImage')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500">标签</label>
        
        {/* Quick Tags */}
        <div className="flex flex-wrap gap-2">
          {PRESET_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddTag(tag)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-md text-xs transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {formData.tags?.map(tag => (
            <span key={tag} className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-md text-xs font-medium border border-rose-100 flex items-center">
              #{tag}
              <button 
                type="button" 
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 opacity-50 hover:opacity-100"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
             type="text"
             value={tagInput}
             onChange={e => setTagInput(e.target.value)}
             onKeyDown={e => {
               if (e.key === 'Enter') {
                 e.preventDefault();
                 handleAddTag(tagInput);
               }
             }}
             placeholder="输入自定义标签..."
             className="flex-1 min-w-[120px] bg-transparent outline-none text-sm px-1 py-1"
          />
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-md border-t border-black/5 p-4 flex space-x-4 z-10">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-neutral-100 text-neutral-800 rounded-xl font-bold active:scale-95 transition-transform"
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-neutral-900 text-white rounded-xl font-bold active:scale-95 transition-transform"
        >
          保存票根
        </button>
      </div>

    </form>
  );
}
