import React, { useState, useMemo } from 'react';
import { Ticket } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface TicketBinderProps {
  tickets: Ticket[];
  onSelect: (ticket: Ticket) => void;
}

export function TicketBinder({ tickets, onSelect }: TicketBinderProps) {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const years = useMemo(() => {
    const yearsSet = new Set(tickets.map(t => new Date(t.date).getFullYear().toString()));
    const sortedYears = Array.from(yearsSet).sort((a,b) => parseInt(b) - parseInt(a));
    return ['全部', ...sortedYears];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    if (selectedYear === '全部') {
      return [...tickets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    return tickets.filter(t => new Date(t.date).getFullYear().toString() === selectedYear);
  }, [tickets, selectedYear]);

  if (tickets.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm h-full pt-20">
        没有找到票根。点击上方 "+" 按钮添加。
      </div>
    );
  }

  if (!selectedYear) {
    return (
      <BinderShelf 
        years={years} 
        onSelectYear={setSelectedYear} 
        tickets={tickets} 
      />
    );
  }

  return (
    <BinderView 
      tickets={filteredTickets} 
      onSelect={onSelect} 
      onBack={() => setSelectedYear(null)} 
      year={selectedYear}
    />
  );
}

interface BinderShelfProps {
  years: string[];
  onSelectYear: (year: string) => void;
  tickets: Ticket[];
}

function BinderShelf({ years, onSelectYear, tickets }: BinderShelfProps) {
  return (
    <div className="flex-1 h-full bg-[#f8fafc] overflow-y-auto p-6 relative pb-28">
      {/* Texture background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
      
      <div className="text-center pt-2 pb-8 text-slate-500 text-sm font-bold tracking-widest relative z-10 drop-shadow-sm pointer-events-none">
        我的票夹
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10 max-w-lg mx-auto">
        {years.map((year) => {
          const yearTickets = year === '全部' 
            ? tickets 
            : tickets.filter(t => new Date(t.date).getFullYear().toString() === year);
          
          const THEMES = [
            'bg-slate-700',   // Slate
            'bg-teal-600',    // Teal
            'bg-sky-600',     // Sky
            'bg-indigo-500',  // Indigo
            'bg-emerald-500', // Emerald
            'bg-blue-500',    // Blue
          ];
          const colorClass = year === '全部' ? 'bg-slate-800' : THEMES[parseInt(year) % THEMES.length];

          return (
            <motion.div
              key={year}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectYear(year)}
              className="relative cursor-pointer group perspective-[1000px]"
              style={{ aspectRatio: '3 / 4' }}
            >
              {/* Pages Edge Simulation */}
              <div className="absolute top-1 bottom-1 left-2 right-[-8px] bg-slate-50 rounded-r-xl shadow-[inset_-2px_0_5px_rgba(0,0,0,0.05)] border-y border-r border-slate-200">
                {/* Pages lines */}
                <div className="absolute inset-0 rounded-r-xl bg-[repeating-linear-gradient(to_bottom,transparent,transparent_3px,rgba(0,0,0,0.02)_3px,rgba(0,0,0,0.02)_4px)]" />
              </div>

              {/* Book Cover */}
              <div 
                className={`absolute inset-0 rounded-r-xl rounded-l-sm shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2),4px_4px_10px_rgba(0,0,0,0.15)] flex flex-col items-center overflow-hidden transform origin-left transition-transform duration-300 group-hover:-rotate-y-6 ${colorClass}`}
              >
                {/* Book Spine Edge Overlay */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/40 via-black/10 to-transparent pointer-events-none z-10 shadow-[2px_0_4px_rgba(0,0,0,0.1)]" />
                
                {/* Faux Leather / Cloth Texture via SVG Noise */}
                <div 
                   className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-overlay z-0" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
                />

                {/* Inner shadow for cover pillowy feel */}
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] rounded-r-xl pointer-events-none z-0" />

                {/* Foil Stamping / Debossed Border */}
                <div className="absolute inset-3 rounded-r-lg rounded-l-sm border border-white/20 shadow-[inset_0_1px_1px_rgba(0,0,0,0.2),0_1px_0_rgba(255,255,255,0.2)] pointer-events-none z-10" />
                <div className="absolute inset-4 rounded-r-md rounded-l-sm border border-white/10 pointer-events-none z-10" />

                {/* Cover Nameplate / Label */}
                <div className="relative z-20 mt-10 w-[70%] bg-[#fafafa] shadow-[0_4px_10px_rgba(0,0,0,0.2),inset_0_0_5px_rgba(0,0,0,0.05)] rounded-sm border border-slate-200 flex flex-col items-center pt-3 pb-0 overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
                    {/* Metal rivets */}
                    <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-slate-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)]" />
                    <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-slate-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)]" />
                    <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-slate-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)]" />
                    <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-slate-300 shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)]" />

                    <span className="text-3xl font-serif font-black text-slate-700 tracking-tighter mt-1" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}>
                        {year}
                    </span>
                    
                    <div className="w-full bg-slate-100/50 mt-3 py-1.5 border-t border-slate-200 flex justify-center">
                       <div className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] text-center w-full">
                          {yearTickets.length} TICKETS
                       </div>
                    </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface BinderViewProps {
  tickets: Ticket[];
  onSelect: (ticket: Ticket) => void;
  onBack: () => void;
  year: string;
}

function BinderView({ tickets, onSelect, onBack, year }: BinderViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < tickets.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
      {/* Texture background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>

      {/* Top Bar with Back Button */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 hover:bg-white text-slate-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-slate-600 text-sm font-bold tracking-widest bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200">
          {year} ({currentIndex + 1} / {tickets.length})
        </div>
      </div>

      {/* The Binder Viewport */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 pt-16 perspective-[1500px]">
        
        {/* Invisible Drag Surface */}
        <motion.div
            className="absolute z-50 cursor-pointer"
            style={{ height: 'min(70vh, 150vw)', aspectRatio: '1 / 2' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
                if (info.offset.x < -40 && currentIndex < tickets.length - 1) {
                    handleNext();
                } else if (info.offset.x > 40 && currentIndex > 0) {
                    handlePrev();
                }
            }}
            onClick={() => {
                if (tickets[currentIndex]) {
                    onSelect(tickets[currentIndex]);
                }
            }}
        />

        {/* Binder pages */}
        <div 
            className="relative flex justify-center items-center pointer-events-none"
            style={{ height: 'min(70vh, 150vw)', aspectRatio: '1 / 2' }}
        >
            {/* Binder loops (Visual only) */}
            <div className="absolute left-[-16px] top-10 bottom-10 w-8 z-30 flex flex-col justify-evenly py-6 pointer-events-none transform translate-z-[1px]">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-row items-center w-full">
                        <div className="w-4 h-6 border-2 border-r-0 border-slate-400 bg-slate-300 rounded-l-full shadow-md" />
                        <div className="w-10 h-1 bg-gradient-to-r from-slate-400 to-transparent opacity-30 -ml-1" />
                    </div>
                ))}
            </div>

            {tickets.map((ticket, index) => {
               const isCurrent = index === currentIndex;
               const isFlipped = index < currentIndex;
               const zIndex = isFlipped ? index : tickets.length - index;
               
               // Render only nearby pages to keep DOM light
               if (Math.abs(index - currentIndex) > 4) return null;

               return (
                   <motion.div
                       key={ticket.id}
                       className="absolute inset-0 origin-left"
                       initial={false}
                       animate={{ 
                           rotateY: isFlipped ? -170 : 0, 
                           zIndex,
                           x: isFlipped ? -15 : index > currentIndex ? (index - currentIndex) * 2 : 0,
                           y: isFlipped ? 0 : index > currentIndex ? (index - currentIndex) * 2 : 0,
                           rotateZ: isCurrent ? 0 : isFlipped ? -0.5 : (index - currentIndex) * 0.3,
                       }}
                       transition={{ duration: 0.6, type: 'spring', bounce: 0.15 }}
                       style={{ transformStyle: 'preserve-3d' }}
                   >
                     
                     {/* Book Page Wrapper - Front */}
                     <div 
                         className="absolute inset-0 bg-[#f9f8f6] rounded-r-xl rounded-l-sm shadow-[2px_4px_16px_rgba(0,0,0,0.15)] overflow-hidden border border-black/5 flex flex-col"
                         style={{ backfaceVisibility: 'hidden' }}
                     >
                         {/* Hole punches */}
                         <div className="absolute left-[-6px] top-10 bottom-10 w-4 flex flex-col justify-evenly py-6 pointer-events-none z-10">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-3 h-3 rounded-full bg-[#d7d3c8] shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] ml-1" />
                            ))}
                         </div>

                         {/* Page Gradient */}
                         <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/10 via-transparent to-black/5 z-20" />

                         {/* Content: Ticket Image Rotated */}
                         {ticket.ticketImage ? (
                             <div className="absolute inset-0 z-0 pointer-events-none">
                                <div 
                                   className="absolute top-1/2 left-1/2 flex items-center justify-center p-2 sm:p-4 pt-6 sm:pt-10"
                                   style={{ width: '200%', height: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
                                >
                                   <img 
                                      src={ticket.ticketImage} 
                                      alt="ticket" 
                                      className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)] rounded-sm grayscale-[0.1]"
                                   />
                                </div>
                             </div>
                         ) : (
                             <div className="absolute inset-0 z-0 pointer-events-none">
                                <div 
                                    className="absolute top-1/2 left-1/2 flex flex-col items-center justify-center p-4 pt-10 text-slate-400"
                                   style={{ width: '200%', height: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
                                >
                                   <ImageIcon className="w-10 h-10 mb-4 opacity-20" />
                                   <div className="text-xl font-bold opacity-30 whitespace-nowrap overflow-hidden text-ellipsis max-w-[80%]">
                                      {ticket.title}
                                   </div>
                                   <div className="text-xs opacity-50 mt-2">未上传票根照片</div>
                                </div>
                             </div>
                         )}

                         {/* Title overlay at the edge */}
                         <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-md text-xs font-bold text-slate-600 shadow shadow-black/10 border border-white/50 z-30 pointer-events-none">
                            {format(new Date(ticket.date), 'MM.dd')} {ticket.title}
                         </div>
                     </div>

                     {/* Book Page Wrapper - Back */}
                     <div 
                         className="absolute inset-0 bg-[#f4f3f0] rounded-l-xl rounded-r-sm shadow-xl overflow-hidden border border-black/5"
                         style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                     >
                         <div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-black/10 via-transparent to-black/5" />
                         
                         {/* Back Hole punches */}
                         <div className="absolute right-[-6px] top-10 bottom-10 w-4 flex flex-col justify-evenly py-6 pointer-events-none">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-3 h-3 rounded-full bg-[#d7d3c8] shadow-[inset_-1px_1px_3px_rgba(0,0,0,0.4)] mr-1" />
                            ))}
                         </div>

                         {/* Back side ghost content */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] scale-x-[-1] pointer-events-none">
                             {ticket.ticketImage ? (
                                <div 
                                   className="absolute top-1/2 left-1/2 flex items-center justify-center p-2 sm:p-4 pb-6 sm:pb-10"
                                   style={{ width: '200%', height: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
                                >
                                   <img 
                                      src={ticket.ticketImage} 
                                      alt="ticket-back" 
                                      className="w-full h-full object-contain"
                                   />
                                </div>
                             ) : (
                                <div 
                                   className="absolute top-1/2 left-1/2 flex items-center justify-center p-4 pb-10"
                                   style={{ width: '200%', height: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
                                >
                                   <ImageIcon className="w-24 h-24" />
                                </div>
                             )}
                         </div>
                     </div>
                   </motion.div>
               );
            })}
        </div>

        {/* Floating Pagination Controls */}
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between items-center z-50 pointer-events-auto">
          <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              disabled={currentIndex === 0}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-800 shadow-xl disabled:opacity-0 disabled:shadow-none hover:bg-white transition-all active:scale-95 border border-white/80"
          >
              <ChevronLeft className="w-6 h-6 -ml-0.5 text-slate-600" />
          </button>

          <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              disabled={currentIndex === tickets.length - 1}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-800 shadow-xl disabled:opacity-0 disabled:shadow-none hover:bg-white transition-all active:scale-95 border border-white/80"
          >
              <ChevronRight className="w-6 h-6 ml-0.5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

