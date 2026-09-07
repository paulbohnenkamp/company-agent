/** Copy only caller identity needed by the server-to-server API boundary. */
export function upstreamHeaders(request: Request, contentType = false): Headers {
  const headers = new Headers();
  const authorization = request.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);
  if (contentType) headers.set("content-type", "application/json");
  return headers;
}
