import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  try {
    const { db, firestore } = await import('../src/lib/firebase-admin');
    console.log('Checking Firebase connection...');
    const ref = db.ref('.info/connected');
    const snap = await ref.once('value');
    console.log('RTDB connection status:', snap.val());

    const cols = await firestore.listCollections();
    console.log('Firestore connected successfully. Collections count:', cols.length);
    process.exit(0);
  } catch (err) {
    console.error('Connection test failed:', err);
    process.exit(1);
  }
}
run();