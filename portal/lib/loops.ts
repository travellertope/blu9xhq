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
