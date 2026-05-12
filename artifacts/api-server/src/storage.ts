import { db } from '@workspace/db';
import { entriesTable } from '@workspace/db';
import { eq, sql } from 'drizzle-orm';

export class Storage {
  async getPriceByTicketQty(ticketQty: number) {
    const result = await db.execute(
      sql`SELECT pr.id, pr.unit_amount, pr.currency
          FROM stripe.prices pr
          JOIN stripe.products p ON pr.product = p.id
          WHERE p.metadata->>'ticketQty' = ${ticketQty.toString()}
            AND pr.active = true
            AND p.active = true
          LIMIT 1`
    );
    return result.rows[0] as { id: string; unit_amount: number; currency: string } | undefined;
  }

  async getEntryBySessionId(stripeSessionId: string) {
    const [entry] = await db
      .select()
      .from(entriesTable)
      .where(eq(entriesTable.stripeSessionId, stripeSessionId));
    return entry;
  }
}

export const storage = new Storage();
