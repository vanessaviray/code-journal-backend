import { ClientError } from './client-error';

type EntryRequestBody = {
  userId?: number;
  title?: string;
  notes?: string;
  photoUrl?: string;
};

type EntryRequestParams = {
  entryId?: string;
};

type EntryRequest = {
  body: EntryRequestBody;
  params: EntryRequestParams;
};

export function ValidateRequestBody(req: EntryRequest): void {
  const reqParams = { ...req.body, ...req.params };
  const missing = [] as string[];
  for (const param in reqParams) {
    (param === undefined || param === '') && missing.push(`${param}`);
  }
  if (missing.length) {
    throw new ClientError(404, `${missing.join(',')} is required`);
  }
  if (reqParams.userId != null) {
    if (!Number.isInteger(reqParams.userId)) {
      throw new ClientError(400, `Non-integer userId: ${reqParams.userId}`);
    }
  }
  if (reqParams.entryId != null) {
    if (!Number.isInteger(+reqParams.entryId)) {
      throw new ClientError(400, `Non-integer entryId: ${reqParams.entryId}`);
    }
  }
}
