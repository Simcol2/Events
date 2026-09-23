import { getSquareClient } from "./_square.js";

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { givenName: "Customer" };
  if (parts.length === 1) return { givenName: parts[0] };
  return {
    givenName: parts[0],
    familyName: parts.slice(1).join(" "),
  };
}

/**
 * Reuses the Square ID already linked to the Supabase customer whenever
 * possible. If this is the first Events booking for the customer, search the
 * same Square seller account by exact email before creating anything.
 *
 * This matters because www.asliceofg.com already uses Square. We do not want
 * a second Square Customer Directory profile merely because the rental site
 * learned about the person later.
 */
export async function ensureSquareCustomer({ supabase, customer }) {
  if (customer.square_customer_id) return customer.square_customer_id;

  const square = getSquareClient();
  const email = String(customer.email || "").trim().toLowerCase();

  if (!email) throw new Error("Customer email is required.");

  const searchResult = await square.customers.search({
    query: {
      filter: {
        emailAddress: {
          exact: email,
        },
      },
    },
    limit: 10,
  });

  const exactMatch = (searchResult.customers || []).find(
    (candidate) =>
      String(candidate.emailAddress || "").trim().toLowerCase() === email
  );

  let squareCustomerId = exactMatch?.id || null;

  if (!squareCustomerId) {
    const name = splitName(customer.name);
    const created = await square.customers.create({
      idempotencyKey: `asg-events-customer-${customer.id}`,
      emailAddress: email,
      givenName: name.givenName,
      familyName: name.familyName,
      referenceId: `events-customer-${customer.id}`,
    });

    squareCustomerId = created.customer?.id || null;
  }

  if (!squareCustomerId) {
    throw new Error("Square did not return a customer ID.");
  }

  const { error } = await supabase
    .from("customers")
    .update({ square_customer_id: squareCustomerId })
    .eq("id", customer.id);

  if (error) throw error;

  return squareCustomerId;
}
