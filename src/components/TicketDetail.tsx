import { useState } from 'react';
import { Ticket } from '../types';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TicketDetailProps {
  ticket: Ticket;
  onEdit: () => void;
  onDelete: () => void;
}

export function TicketDetail({ ticket, onEdit, onDelete }: TicketDetailProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  // Generate random rotation for the stamp, just based on char code to keep it deterministic per ticket
  const seed = ticket.title.charCodeAt(0) || 0;
  const rotation = (seed % 30) - 15; // -15 to +15 degrees

  return (
    <div className="h-full relative overflow-y-auto w-full bg-neutral-900 pb-20">
      {/* Background */}
      {ticket.posterImage ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-50 z-0"
            style={{ backgroundImage: `url(${ticket.posterImage})` }}
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xl pointer-events-none z-0" />
        </>
      ) : (
         <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 pointer-events-none z-0" />
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
        <button
          onClick={onEdit}
          className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-white/20 transition-all active:scale-95"
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 text-rose-400 rounded-full flex items-center justify-center shadow-xl hover:bg-rose-500/20 hover:text-rose-300 transition-all active:scale-95"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-2">删除票根</h3>
            <p className="text-sm text-neutral-500 mb-6">确定要删除这张票根吗？此操作不可恢复。</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={onDelete}
                className="flex-1 py-2.5 rounded-lg font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative pt-6 px-4 pb-20 max-w-sm mx-auto z-10">
        {/* Ticket Container */}
        <div className="bg-[#fcfaf8] rounded-tl-xl rounded-tr-xl shadow-2xl relative overflow-hidden">
          {ticket.posterImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none z-0 mix-blend-multiply"
              style={{ backgroundImage: `url(${ticket.posterImage})` }}
            />
          )}

          {/* Top Header */}
          <div className="px-6 py-8 border-b-2 border-dashed border-neutral-300 relative z-10">
            
            {/* The Stamp (Date) */}
            <div 
              className="absolute top-4 right-4 border-2 border-rose-600 rounded-full w-20 h-20 flex flex-col items-center justify-center text-rose-600 transform opacity-80 pointer-events-none"
              style={{ rotate: `${rotation}deg` }}
            >
              <div className="text-[10px] uppercase font-bold tracking-widest border-b border-rose-600 pb-0.5 mb-0.5">
                {ticket.category}
              </div>
              <div className="text-sm font-bold leading-none">
                {format(new Date(ticket.date), 'MM.dd')}
              </div>
              <div className="text-[10px] font-bold leading-none mt-1">
                {format(new Date(ticket.date), 'yyyy')}
              </div>
            </div>

            <div className="text-sm text-neutral-500 mb-1">{ticket.category}</div>
            <h2 className="text-2xl font-black text-neutral-800 leading-tight pr-12">
              {ticket.title}
            </h2>
          </div>

          {/* Details Section */}
          <div className="px-6 py-6 space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">演出时间</div>
                 <div className="text-sm text-neutral-800 font-medium">
                   {format(new Date(ticket.date), 'yyyy-MM-dd')} {ticket.time}
                 </div>
               </div>
               <div>
                 <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">演出场地</div>
                 <div className="text-sm text-neutral-800 font-medium leading-tight">
                   {ticket.venue || '未知场馆'}
                 </div>
               </div>
               <div>
                 <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">座位</div>
                 <div className="text-sm text-neutral-800 font-medium">
                   {ticket.seat || '无座位信息'}
                 </div>
               </div>
               <div>
                 <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">票价</div>
                 <div className="text-sm text-neutral-800 font-medium">
                   {ticket.price ? `¥${ticket.price}` : '未知'}
                 </div>
               </div>
            </div>

            {ticket.cast && (
              <div className="pt-2">
                <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">卡司阵容</div>
                <div className="text-sm text-neutral-800 leading-relaxed font-medium whitespace-pre-wrap break-words">
                  {ticket.cast}
                </div>
              </div>
            )}
            
            {ticket.tags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {ticket.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded text-xs font-semibold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="w-full flex justify-between items-center bg-[#fcfaf8] relative">
          <div className="w-4 h-8 bg-neutral-900 rounded-r-full absolute left-0 shrink-0 border-r border-y border-black/10" />
          <div className="w-full h-px border-b-2 border-dashed border-neutral-300 mx-4" />
          <div className="w-4 h-8 bg-neutral-900 rounded-l-full absolute right-0 shrink-0 border-l border-y border-black/10" />
        </div>

        {/* Bottom Section (Review & Images) */}
        <div className="bg-[#fcfaf8] rounded-bl-xl rounded-br-xl shadow-2xl px-6 py-6 relative overflow-hidden">
          {ticket.posterImage && (
            <div 
              className="absolute inset-0 bg-cover bg-bottom opacity-15 pointer-events-none z-0 mix-blend-multiply"
              style={{ backgroundImage: `url(${ticket.posterImage})` }}
            />
          )}

          <div className="relative z-10">
            {ticket.review && (
            <div className="mb-6">
              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">观后感</div>
              <div className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap break-words">
                {ticket.review}
              </div>
            </div>
          )}

          {ticket.ticketImage && (
            <div>
              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">票根留影</div>
              <div className="rounded-lg overflow-hidden border border-neutral-200">
                <img src={ticket.ticketImage} alt="Ticket" className="w-full h-auto" />
              </div>
            </div>
          )}

          {!ticket.review && !ticket.ticketImage && (
             <div className="text-center text-neutral-400 text-xs py-4 opacity-50">
                背部空白
             </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
