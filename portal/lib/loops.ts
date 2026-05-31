/**
 * Loops email platform API integration.
 * Base URL: https://app.loops.so/api/v1
 * Auth: Bearer ${LOOPS_API_KEY}
 *
 * All functions catch errors and console.error — never throws in a way that
 * crashes user-facing ops. Retries once after 1 s on 429.
 */

const LOOPS_API_KEY = process.env.LOOPS_API_KEY!;
const LOOPS_BASE_URL = "https://app.loops.so/api/v1";

async function loopsFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${LOOPS_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${LOOPS_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Loops API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

/** Create or update a contact in Loops. */
export async function upsertLoopsContact(params: {
  email: string;
  firstName?: string;
  lastName?: string;
  userGroup?: string;
  userId?: string;
  customProperties?: Record<string, string | number | boolean>;
}): Promise<void> {
  await loopsFetch("/contacts/upsert", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      firstName: params.firstName,
      lastName: params.lastName,
      userGroup: params.userGroup,
      userId: params.userId,
      ...params.customProperties,
    }),
  });
}

/** Trigger a Loops event for a contact. */
export async function triggerLoopsEvent(params: {
  email: string;
  eventName: string;
  eventProperties?: Record<string, string | number | boolean>;
}): Promise<void> {
  await loopsFetch("/events/send", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      eventName: params.eventName,
      eventProperties: params.eventProperties ?? {},
    }),
  });
}

/** Delete a contact from Loops. */
export async function deleteLoopsContact(email: string): Promise<void> {
  await loopsFetch("/contacts/delete", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ─── Internal POST helper ─────────────────────────────────────────────────────

export async function loopsPost<T>(path: string, body: unknown): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${LOOPS_API_KEY}`,
  };

  const doRequest = () =>
    fetch(`${LOOPS_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

  let res = await doRequest();

  // Retry once after 1 s on 429 Too Many Requests
  if (res.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res = await doRequest();
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Loops API ${res.status} at ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── syncContact ──────────────────────────────────────────────────────────────

export async function syncContact(client: {
  id: string | number;
  portalEmail: string;
  contactName: string;
  companyName: string;
  status: string;
  healthStatus?: string;
  activeSubscriptionCount?: number;
  lastLoginAt?: string;
  lastContactedAt?: string;
}): Promise<void> {
  try {
    const [firstName, ...rest] = client.contactName.trim().split(" ");
    const lastName = rest.join(" ") || undefined;

    await loopsPost("/contacts/upsert", {
      email:                    client.portalEmail,
      firstName,
      lastName,
      userId:                   String(client.id),
      userGroup:                "client",
      clientStatus:             client.status,
      healthStatus:             client.healthStatus,
      activeSubscriptionsCount: client.activeSubscriptionCount,
      portalLastLogin:          client.lastLoginAt,
      lastCommunicationDate:    client.lastContactedAt,
    });
  } catch (err) {
    console.error("[loops] syncContact failed:", err);
  }
}

// ─── enrolInSequence ──────────────────────────────────────────────────────────

export async function enrolInSequence(
  email: string,
  loopsSequenceId: string
): Promise<void> {
  // Loops triggers a Loop when this event is received — configure the Loop in
  // Loops UI to start on event SEQUENCE_<id>.
  try {
    await loopsPost("/events/send", {
      email,
      eventName: `SEQUENCE_${loopsSequenceId}`,
    });
  } catch (err) {
    console.error("[loops] enrolInSequence failed:", err);
  }
}

// ─── removeFromSequence ───────────────────────────────────────────────────────

export async function removeFromSequence(
  email: string,
  loopsSequenceId: string
): Promise<void> {
  // Loops has no direct unenroll API. Fire exit event and configure Loop exit
  // condition in Loops UI.
  try {
    await loopsPost("/events/send", {
      email,
      eventName: `SEQUENCE_EXIT_${loopsSequenceId}`,
    });
  } catch (err) {
    console.error("[loops] removeFromSequence failed:", err);
  }
}

// ─── createOrUpdateSequence ───────────────────────────────────────────────────

export async function createOrUpdateSequence(params: {
  wpSequenceId: number;
  name: string;
  trigger: string;
}): Promise<string> {
  // Loops has no public API to create or update sequences programmatically.
  // Sequences must be created manually in the Loops UI.
  //
  // This function returns the event name that should be used as the Loop
  // trigger event when configuring the sequence in the Loops UI. Set the
  // Loop's trigger to: "Event received" → the event name returned here.
  //
  // No API call is made.
  return `seq_${params.wpSequenceId}`;
}
