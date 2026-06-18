import { config } from "dotenv";
config({ path: ".env.local" });
import { getDb } from "../db";
import { grammarExercises } from "../db/schema";
getDb().select().from(grammarExercises).then(res => {
  const missing = res.filter(r => !r.choices || (r.choices as string[]).length === 0);
  console.log('Missing choices:', missing.length);
  missing.forEach(m => console.log(m.prompt));
  process.exit(0);
});
