import { getDb } from "@/db";
import { rcPassages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminApi } from "@/lib/admin-api-guard";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function DELETE(req: Request) {
  try {
    const rateLimited = checkRateLimit(getClientIp(req));
    if (rateLimited) return rateLimited;

    const guard = await requireAdminApi();
    if (guard instanceof Response) return guard;

    const data = await req.json();
    const { passageId } = data;

    if (!passageId) {
      return Response.json({ error: "Missing passageId" }, { status: 400 });
    }

    const db = getDb();
    
    // The foreign keys in schema.ts are set up with `onDelete: "cascade"`,
    // so deleting the passage will automatically delete rc_questions and rc_options.
    await db.delete(rcPassages).where(eq(rcPassages.id, passageId));

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("RC Delete Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
