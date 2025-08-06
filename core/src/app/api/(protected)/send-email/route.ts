import "server-only";

import { z } from "zod";

import { withAuthenticatedApiHandler } from "@/zap/lib/api/handlers";
import { parseRequestBody } from "@/zap/lib/api/utils";
import { sendAdminEmailService } from "@/zap/services/mails/send-admin-email.service";

const SendMailSchema = z.object({
  subject: z.string(),
  recipients: z.array(z.string()),
});

export const POST = withAuthenticatedApiHandler(async (req: Request) => {
  const { subject, recipients } = await parseRequestBody(req, SendMailSchema);

  const data = await sendAdminEmailService({
    input: { subject, recipients },
  });

  return Response.json(data, { status: 200 });
});
