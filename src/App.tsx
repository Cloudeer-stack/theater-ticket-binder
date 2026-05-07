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
      <header className="flex-none bg-white/80 backdrop-blur-md border-b border-black/5 z-20 px-4 h-14 flex flex-row items-center justify-between sticky top-0">
        <div className="flex items-center space-x-2">
          {(view === 'detail' || view === 'form' || view === 'settings') && (
            <button
              onClick={() => {
                if (view === 'form' && !editingTicket) setView('list');
                else if (view === 'form' && editingTicket) setView('detail');
                else setView('list');
              }}
              className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-700" />
            </button>
          )}
          <h1 className="text-lg font-bold text-neutral-800 tracking-tight">剧场票夹</h1>
        </div>
        
        {(view === 'list' || view === 'binder') && (
          <div className="flex items-center space-x-1">
             <button
              onClick={() => setView(view === 'list' ? 'binder' : 'list')}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              {view === 'list' ? <Book className="w-5 h-5 text-neutral-600" /> : <List className="w-5 h-5 text-neutral-600" />}
            </button>
             <button
              onClick={() => setView('settings')}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-neutral-600" />
            </button>
            <button
              onClick={handleCreate}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <Plus className="w-6 h-6 text-neutral-800" />
            </button>
          </div>
        )}
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
              className="absolute inset-0 overflow-y-auto"
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
              className="absolute inset-0 bg-[#e8e4dc]"
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
    </div>
  );
}
