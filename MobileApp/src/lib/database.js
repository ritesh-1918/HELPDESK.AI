import * as SQLite from 'expo-sqlite';

let db = null;

export const initDB = async () => {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('helpdesk.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      subject TEXT,
      description TEXT,
      status TEXT,
      category TEXT,
      priority TEXT,
      created_at TEXT,
      updated_at TEXT,
      raw_json TEXT
    );

    CREATE TABLE IF NOT EXISTS ticket_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT,
      sender_id TEXT,
      sender_name TEXT,
      sender_role TEXT,
      message TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      message TEXT,
      read INTEGER DEFAULT 0,
      created_at TEXT,
      raw_json TEXT
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT,
      email TEXT,
      avatar_url TEXT,
      role TEXT,
      raw_json TEXT
    );
  `);

  return db;
};

const getDB = async () => {
  if (!db) await initDB();
  return db;
};

export const cacheTickets = async (tickets) => {
  const database = await getDB();
  await database.execAsync('DELETE FROM tickets');
  for (const t of tickets) {
    await database.runAsync(
      `INSERT INTO tickets (id, user_id, subject, description, status, category, priority, created_at, updated_at, raw_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id, t.user_id, t.subject, t.description, t.status,
        t.category || null, t.priority || null, t.created_at, t.updated_at || null,
        JSON.stringify(t),
      ]
    );
  }
};

export const getCachedTickets = async () => {
  const database = await getDB();
  const rows = await database.getAllAsync('SELECT * FROM tickets ORDER BY created_at DESC');
  return rows.map((r) => ({ ...JSON.parse(r.raw_json || '{}'), id: r.id }));
};

export const cacheTicketDetail = async (ticket) => {
  const database = await getDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO tickets (id, user_id, subject, description, status, category, priority, created_at, updated_at, raw_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      ticket.id, ticket.user_id, ticket.subject, ticket.description, ticket.status,
      ticket.category || null, ticket.priority || null, ticket.created_at, ticket.updated_at || null,
      JSON.stringify(ticket),
    ]
  );
};

export const getCachedTicketDetail = async (ticketId) => {
  const database = await getDB();
  const row = await database.getFirstAsync('SELECT * FROM tickets WHERE id = ?', [ticketId]);
  if (!row) return null;
  return { ...JSON.parse(row.raw_json || '{}'), id: row.id };
};

export const cacheTicketMessages = async (messages) => {
  const database = await getDB();
  for (const m of messages) {
    await database.runAsync(
      `INSERT OR REPLACE INTO ticket_messages (id, ticket_id, sender_id, sender_name, sender_role, message, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [m.id, m.ticket_id, m.sender_id, m.sender_name, m.sender_role, m.message, m.created_at]
    );
  }
};

export const getCachedTicketMessages = async (ticketId) => {
  const database = await getDB();
  return await database.getAllAsync(
    'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC',
    [ticketId]
  );
};

export const cacheNotifications = async (notifications) => {
  const database = await getDB();
  await database.execAsync('DELETE FROM notifications');
  for (const n of notifications) {
    await database.runAsync(
      `INSERT INTO notifications (id, user_id, title, message, read, created_at, raw_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [n.id, n.user_id, n.title || null, n.message || null, n.read ? 1 : 0, n.created_at, JSON.stringify(n)]
    );
  }
};

export const getCachedNotifications = async () => {
  const database = await getDB();
  const rows = await database.getAllAsync('SELECT * FROM notifications ORDER BY created_at DESC');
  return rows.map((r) => ({ ...JSON.parse(r.raw_json || '{}'), id: r.id, read: !!r.read }));
};

export const cacheProfile = async (profile) => {
  const database = await getDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO profiles (id, full_name, email, avatar_url, role, raw_json)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [profile.id, profile.full_name, profile.email, profile.avatar_url, profile.role, JSON.stringify(profile)]
  );
};

export const getCachedProfile = async (userId) => {
  const database = await getDB();
  const row = await database.getFirstAsync('SELECT * FROM profiles WHERE id = ?', [userId]);
  if (!row) return null;
  return JSON.parse(row.raw_json || '{}');
};

export const clearCache = async () => {
  const database = await getDB();
  await database.execAsync(`
    DELETE FROM tickets;
    DELETE FROM ticket_messages;
    DELETE FROM notifications;
    DELETE FROM profiles;
  `);
};
