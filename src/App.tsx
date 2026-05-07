/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Ticket } from './types';
import { storage } from './lib/storage';
import { TicketList } from './components/TicketList';
import { TicketDetail } from './components/TicketDetail';
import { TicketForm } from './components/TicketForm';
import { Settings } from './components/Settings';
import { TicketBinder } from './components/TicketBinder';
import { Plus, Settings as SettingsIcon, ChevronLeft, Book, List } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

type View = 'list' | 'binder' | 'detail' | 'form' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const data = await storage.getTickets();
    setTickets(data);
  };

  const handleCreate = () => {
    setEditingTicket(null);
    setView('form');
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setView('form');
  };

  const handleSave = async (ticket: Ticket) => {
    if (editingTicket) {
      await storage.updateTicket(ticket);
    } else {
      await storage.addTicket(ticket);
    }
    await loadTickets();
    setSelectedTicket(ticket);
    setView('detail');
  };

  const handleDelete = async (id: string) => {
    await storage.deleteTicket(id);
    await loadTickets();
    setView('list');
    setSelectedTicket(null);
  };

  return (
    <div className="max-w-md mx-auto h-screen relative bg-neutral-100 overflow-hidden shadow-2xl flex flex-col font-sans">
      {/* Header */}
      <header className="flex-none bg-white/80 backdrop-blur-md border-b border-black/5 z-20 px-4 pt-[env(safe-area-inset-top,0.5rem)] pb-2 flex flex-row items-center justify-between sticky top-0 min-h-[3.5rem]">
        <div className="flex items-center w-full mt-2">
          {(view === 'detail' || view === 'form' || view === 'settings') && (
            <button
              onClick={() => {
                if (view === 'form' && !editingTicket) setView('list');
                else if (view === 'form' && editingTicket) setView('detail');
                else setView('list');
              }}
              className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors absolute left-4"
            >
              <ChevronLeft className="w-6 h-6 text-neutral-700" />
            </button>
          )}
          <h1 className="text-lg font-bold text-neutral-800 tracking-tight flex-1 text-center">
            {view === 'settings' ? '设置' : view === 'form' ? (editingTicket ? '编辑票根' : '添加票根') : view === 'detail' ? '票根详情' : '剧场票夹'}
          </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-neutral-50/50">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 overflow-y-auto pb-24"
            >
              <TicketList 
                tickets={tickets} 
                onSelect={(doc) => { setSelectedTicket(doc); setView('detail'); }} 
              />
            </motion.div>
          )}

          {view === 'binder' && (
            <motion.div
              key="binder"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-[#e8e4dc] pb-24"
            >
              <TicketBinder
                tickets={tickets} 
                onSelect={(doc) => { setSelectedTicket(doc); setView('detail'); }} 
              />
            </motion.div>
          )}
          
          {view === 'detail' && selectedTicket && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute inset-0 overflow-hidden"
            >
              <TicketDetail 
                ticket={selectedTicket} 
                onEdit={() => handleEdit(selectedTicket)}
                onDelete={() => handleDelete(selectedTicket.id)}
              />
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 bg-white overflow-y-auto"
            >
              <TicketForm 
                initialData={editingTicket || undefined} 
                onSave={handleSave} 
                onCancel={() => {
                  if (editingTicket) setView('detail');
                  else setView('list');
                }} 
              />
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-white overflow-y-auto"
            >
              <Settings onDataChanged={loadTickets} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Toolbar */}
      {(view === 'list' || view === 'binder') && (
        <>
          {/* Floating Action Button */}
          <button
            onClick={handleCreate}
            className="absolute bottom-24 right-4 w-14 h-14 bg-neutral-900 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl active:scale-95 transition-transform hover:bg-neutral-800 z-40 border border-white/20"
          >
            <Plus className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-black/5 pb-[env(safe-area-inset-bottom,0.5rem)] z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-center px-6 pt-2 pb-1 h-14 max-w-sm mx-auto">
              <button
                onClick={() => setView('list')}
                className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${view === 'list' ? 'text-neutral-900' : 'text-neutral-400'}`}
              >
                <List className="w-6 h-6 flex-shrink-0" />
                <span className="text-[10px] font-bold leading-none">列表</span>
              </button>
              <button
                onClick={() => setView('binder')}
                className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${view === 'binder' ? 'text-neutral-900' : 'text-neutral-400'}`}
              >
                <Book className="w-6 h-6 flex-shrink-0" />
                <span className="text-[10px] font-bold leading-none">票夹</span>
              </button>
              
               <button
                onClick={() => setView('settings')}
                 className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${view === 'settings' ? 'text-neutral-900' : 'text-neutral-400'}`}
              >
                <SettingsIcon className="w-6 h-6 flex-shrink-0" />
                <span className="text-[10px] font-bold leading-none">设置</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
