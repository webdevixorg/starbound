import React from 'react';
import Ticket from './Ticket';

interface TicketData {
  id: string;
  time: string;
  title: string;
  description: string;
  author: string;
  tags: string;
  replies: number;
  likes: number;
}

interface TicketsProps {
  activeTab: string;
}

const ticketData: TicketData[] = [
  {
    id: '2020-3454',
    time: '11:52 AM',
    title: 'How To Write Better Advertising Copy',
    description:
      'I hate peeping Toms. For one thing they usually step all over the hedges and plants...',
    author: 'Syamsir Alam',
    tags: 'Design, Help, UI, Installation',
    replies: 4,
    likes: 1,
  },
  {
    id: '2020-3452',
    time: '08:01 PM',
    title: 'Cleaning And Organizing',
    description:
      'To a general advertiser outdoor advertising is worthy of consideration...',
    author: 'Syifa Hadju',
    tags: 'Design, Help, UI, Figmajom',
    replies: 7,
    likes: 10,
  },
  {
    id: '2020-0032',
    time: '09:50 AM',
    title: 'Baby Monitor Technology',
    description:
      'To a general advertiser outdoor advertising is worthy of consideration...',
    author: 'Syifa Hadju',
    tags: 'Design, Help, UI, Figmajom',
    replies: 7,
    likes: 10,
  },
];

const filteredData = (activeTab: string) => {
  switch (activeTab) {
    case 'Started':
      return ticketData.filter((ticket) => ticket.id === '2020-3454'); // Replace with real filter logic
    case 'Snoozed':
      return ticketData.filter((ticket) => ticket.id === '2020-3452'); // Replace with real filter logic
    case 'Drafts':
      return ticketData.filter((ticket) => ticket.id === '2020-0032'); // Replace with real filter logic
    case 'Deleted':
      return [];
    default:
      return ticketData;
  }
};

const Tickets: React.FC<TicketsProps> = ({ activeTab }) => {
  const tickets = filteredData(activeTab);

  return (
    <section className="tickets">
      {tickets.map((ticket) => (
        <Ticket key={ticket.id} {...ticket} />
      ))}
    </section>
  );
};

export default Tickets;
