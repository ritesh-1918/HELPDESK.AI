import * as SQLite from 'expo-sqlite';

// Initialize the database synchronously
const db = SQLite.openDatabaseSync('helpdesk.db');

export const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS local_tickets (
      id TEXT PRIMARY KEY,
      subject TEXT,
      description TEXT,
      status TEXT,
      category TEXT,
      user_id TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS local_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT,
      sender_id TEXT,
      message TEXT,
      role TEXT,
      created_at TEXT
    );
  `);
};

// -- TICKETS --
export const syncTickets = (tickets) => {
  if (!tickets || tickets.length === 0) return;
  // Use a transaction for bulk insert/replace
  const statement = db.prepareSync(
    'INSERT OR REPLACE INTO local_tickets (id, subject, description, status, category, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  
  tickets.forEach(t => {
    statement.executeSync([
      t.id, t.subject, t.description, t.status, t.category, t.user_id, t.created_at, t.updated_at
    ]);
  });
};

export const getLocalTickets = (userId) => {
  return db.getAllSync('SELECT * FROM local_tickets WHERE user_id = ? ORDER BY created_at DESC', [userId]);
};

export const getLocalTicket = (ticketId) => {
  return db.getFirstSync('SELECT * FROM local_tickets WHERE id = ?', [ticketId]);
};

// -- MESSAGES --
export const syncMessages = (ticketId, messages) => {
  if (!messages || messages.length === 0) return;
  
  const statement = db.prepareSync(
    'INSERT OR REPLACE INTO local_messages (id, ticket_id, sender_id, message, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );
  
  messages.forEach(m => {
    statement.executeSync([
      m.id, m.ticket_id, m.sender_id, m.message, m.role, m.created_at
    ]);
  });
};

export const getLocalMessages = (ticketId) => {
  return db.getAllSync('SELECT * FROM local_messages WHERE ticket_id = ? ORDER BY created_at ASC', [ticketId]);
};

// Initialize on load
try {
  initDB();
} catch (e) {
  console.error("Failed to initialize SQLite:", e);
}
