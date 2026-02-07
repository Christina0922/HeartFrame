import { nanoid } from 'nanoid';

// better-sqlite3가 설치되지 않은 경우를 위한 fallback
let Database: any;
let db: any;
let orders: Map<string, any> = new Map();

// better-sqlite3는 설치되지 않았으므로 인메모리 저장소 사용
console.warn('better-sqlite3 not available, using in-memory storage');
  
// 인메모리 DB 인터페이스
db = {
  exec: () => {},
  prepare: (sql: string) => ({
    run: (...args: any[]) => {
      if (sql.includes('INSERT')) {
        const order: any = {
          id: args[0],
          token: args[1],
          recipient: args[2],
          date: args[3],
          mood: args[4],
          core_sentence: args[5],
          name: args[6] || null,
          keywords: args[7] || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        };
        orders.set(order.token, order);
      } else if (sql.includes('UPDATE')) {
        const token = args[args.length - 1];
        const order = orders.get(token);
        if (order) {
          const updates: any = {};
          if (sql.includes('poem_text')) updates.poem_text = args[0];
          if (sql.includes('image_url')) updates.image_url = args[1];
          if (sql.includes('status')) updates.status = args[0];
          if (sql.includes('price_plan')) updates.price_plan = args[0];
          if (sql.includes('stripe_session_id')) updates.stripe_session_id = args[0];
          if (sql.includes('share_token')) updates.share_token = args[0];
          if (sql.includes('paid_at')) updates.paid_at = args[0];
          Object.assign(order, updates);
        }
      }
    },
    get: (...args: any[]) => {
      const token = args[0] || args[1];
      return orders.get(token) || null;
    },
  }),
};

// 인메모리 저장소를 위한 전역 변수
if (typeof global !== 'undefined') {
  (global as any).__inMemoryOrders = orders;
}

// 초기화 (better-sqlite3가 있는 경우에만)
if (Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      share_token TEXT UNIQUE,
      recipient TEXT NOT NULL,
      date TEXT NOT NULL,
      mood TEXT NOT NULL,
      core_sentence TEXT NOT NULL,
      name TEXT,
      keywords TEXT,
      poem_text TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'pending',
      price_plan TEXT,
      stripe_session_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME
    )
  `);
}

export interface Order {
  id: string;
  token: string;
  share_token?: string;
  recipient: string;
  date: string;
  mood: string;
  core_sentence: string;
  name?: string;
  keywords?: string;
  poem_text?: string;
  image_url?: string;
  status: 'pending' | 'generating' | 'preview' | 'paid' | 'failed';
  price_plan?: string;
  stripe_session_id?: string;
  created_at: string;
  paid_at?: string;
}

export function createOrder(data: {
  recipient: string;
  date: string;
  mood: string;
  core_sentence: string;
  name?: string;
  keywords?: string;
}): Order {
  const id = nanoid();
  const token = nanoid(32);
  
  if (Database) {
    const stmt = db.prepare(`
      INSERT INTO orders (id, token, recipient, date, mood, core_sentence, name, keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      token,
      data.recipient,
      data.date,
      data.mood,
      data.core_sentence,
      data.name || null,
      data.keywords || null
    );
  } else {
    // 인메모리 저장소
    const orders = (global as any).__inMemoryOrders || new Map();
    const order: Order = {
      id,
      token,
      recipient: data.recipient,
      date: data.date,
      mood: data.mood,
      core_sentence: data.core_sentence,
      name: data.name,
      keywords: data.keywords,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    orders.set(token, order);
    (global as any).__inMemoryOrders = orders;
  }
  
  return getOrderByToken(token)!;
}

export function getOrderByToken(token: string): Order | null {
  if (Database) {
    const stmt = db.prepare('SELECT * FROM orders WHERE token = ? OR share_token = ?');
    const row = stmt.get(token, token) as any;
    return row ? row as Order : null;
  } else {
    // 인메모리 저장소
    const orders = (global as any).__inMemoryOrders;
    if (!orders) return null;
    for (const order of orders.values()) {
      if (order.token === token || order.share_token === token) {
        return order as Order;
      }
    }
    return null;
  }
}

export function getOrderByShareToken(shareToken: string): Order | null {
  if (Database) {
    const stmt = db.prepare('SELECT * FROM orders WHERE share_token = ?');
    const row = stmt.get(shareToken) as any;
    return row ? row as Order : null;
  } else {
    const orders = (global as any).__inMemoryOrders;
    if (!orders) return null;
    for (const order of orders.values()) {
      if (order.share_token === shareToken) {
        return order as Order;
      }
    }
    return null;
  }
}

export function getOrderById(id: string): Order | null {
  if (Database) {
    const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
    const row = stmt.get(id) as any;
    return row ? row as Order : null;
  } else {
    const orders = (global as any).__inMemoryOrders;
    if (!orders) return null;
    for (const order of orders.values()) {
      if (order.id === id) {
        return order as Order;
      }
    }
    return null;
  }
}

export function updateOrder(token: string, data: Partial<Order>): void {
  if (Database) {
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return;
    
    values.push(token);
    const stmt = db.prepare(`UPDATE orders SET ${fields.join(', ')} WHERE token = ?`);
    stmt.run(...values);
  } else {
    // 인메모리 저장소
    const orders = (global as any).__inMemoryOrders;
    if (!orders) return;
    const order = orders.get(token);
    if (order) {
      Object.assign(order, data);
    }
  }
}

export default db;

