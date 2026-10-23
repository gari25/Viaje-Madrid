-- ViajeX shared data. Apply to D1 after reviewing access protections.
CREATE TABLE IF NOT EXISTS shared_state (
  state_key TEXT PRIMARY KEY,
  json_value TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS change_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_key TEXT NOT NULL,
  revision INTEGER NOT NULL,
  actor TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
