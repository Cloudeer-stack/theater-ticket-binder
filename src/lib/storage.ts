import localforage from 'localforage';
import { Ticket } from '../types';

localforage.config({
  name: 'TicketBinder',
  storeName: 'tickets'
});

export const storage = {
  async getTickets(): Promise<Ticket[]> {
    const tickets = await localforage.getItem<Ticket[]>('tickets');
    return (tickets || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  async saveTickets(tickets: Ticket[]): Promise<void> {
    await localforage.setItem('tickets', tickets);
  },
  async addTicket(ticket: Ticket): Promise<void> {
    const tickets = await this.getTickets();
    tickets.push(ticket);
    await this.saveTickets(tickets);
  },
  async updateTicket(updated: Ticket): Promise<void> {
    const tickets = await this.getTickets();
    const index = tickets.findIndex(t => t.id === updated.id);
    if (index > -1) {
      tickets[index] = updated;
      await this.saveTickets(tickets);
    }
  },
  async deleteTicket(id: string): Promise<void> {
    const tickets = await this.getTickets();
    const newTickets = tickets.filter(t => t.id !== id);
    await this.saveTickets(newTickets);
  }
};
