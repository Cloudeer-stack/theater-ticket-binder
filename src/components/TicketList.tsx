import { useState, useMemo } from 'react';
import { Ticket } from '../types';
import { Search, Filter, CalendarDays, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface TicketListProps {
  tickets: Ticket[];
  onSelect: (ticket: Ticket) => void;
}

export function TicketList({ tickets, onSelect }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('全部');

  const categories = ['全部', '音乐剧', '话剧', '舞剧', '其他'];

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCategory = activeCategory === '全部' || ticket.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [tickets, searchTerm, activeCategory]);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 flex-none space-y-3 bg-white/60 backdrop-blur-md border-b border-slate-100 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索剧目、场馆、标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100/50 rounded-full text-sm text-slate-700 placeholder:text-slate-400 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/30 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20 border border-teal-500' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            没有找到票根。点击上方 "+" 按钮添加。
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => onSelect(ticket)}
              className="w-full text-left relative focus:outline-none group active:scale-[0.98] transition-transform"
            >
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex overflow-hidden hover:border-teal-200 transition-colors">
                {/* Left: Thumbnail */}
                <div className="w-1/3 aspect-[3/4] bg-slate-50 relative shrink-0">
                  {ticket.posterImage || ticket.ticketImage ? (
                    <img 
                      src={ticket.posterImage || ticket.ticketImage} 
                      alt={ticket.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 border-r border-slate-100">
                      <CalendarDays className="w-8 h-8 mb-2 opacity-30" />
                      <span className="text-xs opacity-50 px-2 text-center leading-tight">暂无海报</span>
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-slate-800/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                    {ticket.category}
                  </div>
                </div>

                {/* Card Cutout visual (perforated line) */}
                <div className="flex flex-col justify-between py-2 -ml-[1px] relative z-10 w-4 items-center bg-white">
                  <div className="w-3 h-3 rounded-full bg-slate-50 -mt-4 shadow-inner border border-slate-100" />
                  <div className="w-px h-full border-l-2 border-dashed border-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-50 -mb-4 shadow-inner border border-slate-100" />
                </div>
                
                {/* Right: Info */}
                <div className="flex-1 p-3 flex flex-col justify-between relative bg-white">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight mb-1 line-clamp-2">
                      {ticket.title}
                    </h3>
                    
                    <div className="text-xs text-slate-500 flex items-center space-x-1 mt-2">
                      <CalendarDays className="w-3 h-3 text-teal-500/70" />
                      <span>{format(new Date(ticket.date), 'yyyy.MM.dd')} {ticket.time || ''}</span>
                    </div>
                    
                    <div className="text-xs text-slate-500 flex items-start space-x-1 mt-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-teal-500/70" />
                      <span className="line-clamp-1">{ticket.venue} {ticket.seat && `· ${ticket.seat}`}</span>
                    </div>
                  </div>

                  {ticket.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-3">
                       {ticket.tags.slice(0, 3).map(tag => (
                         <span key={tag} className="px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded text-[10px] font-medium border border-sky-100">
                           {tag}
                         </span>
                       ))}
                       {ticket.tags.length > 3 && (
                         <span className="px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded text-[10px] border border-slate-100">
                           +{ticket.tags.length - 3}
                         </span>
                       )}
                     </div>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
