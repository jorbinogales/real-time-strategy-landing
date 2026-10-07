import { getDb } from '../db/client';

getDb().then(() => { console.log('Migraciones al día.'); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
