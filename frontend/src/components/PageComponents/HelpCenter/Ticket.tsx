import React from 'react';

interface TicketProps {
  id: string;
  time: string;
  title: string;
  description: string;
  author: string;
  tags: string;
  replies: number;
  likes: number;
}

const Ticket: React.FC<TicketProps> = ({
  id,
  time,
  title,
  description,
  author,
  tags,
  replies,
  likes,
}) => {
  return (
    <div className="ticket bg-white p-5 mb-2 rounded shadow-md">
      <div className="ticket-header flex justify-between mb-2">
        <div className="ticket-id">Ticket #{id}</div>
        <div className="ticket-time">{time}</div>
      </div>
      <div className="ticket-body">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="ticket-footer text-sm text-gray-400 flex">
          <span className="mr-4 last:mr-0">{author}</span>
          <span className="mr-4 last:mr-0">{tags}</span>
          <span className="mr-4 last:mr-0">{replies} replies</span>
          <span className="mr-4 last:mr-0">{likes} likes</span>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
