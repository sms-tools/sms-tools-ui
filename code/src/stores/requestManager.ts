import router from '@/router';

/**
 * Makes an HTTP request to the specified API endpoint.
 *
 * @param pages - The API endpoint to which the request is made.
 * @param method - The HTTP method to use for the request (default is 'get').
 * @param body - The request payload to send with the request (default is an empty object).
 * @returns A promise that resolves to an object containing the response status and body, or void if the request fails.
 */
async function request(
  pages: string,
  method: RequestInit['method'] = 'get',
  body = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{
  status: number;
  body: {
    [key: string]: any;
  };
} | void> {
  const apiLink = localStorage.getItem('apiLink');
  const token = localStorage.getItem('authToken');

  if (token == null || !token) return newLogin();

  const response = await fetch(apiLink + pages, {
    method,
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: method.toLowerCase() !== 'get' ? JSON.stringify(body) : undefined,
  });

  if (response.status == 401) return newLogin();
  const resBody = await response.json();
  if (!resBody) return { status: response.status, body: {} };
  //do not copy all object
  return { status: response.status, body: resBody };
}

function newLogin() {
  localStorage.removeItem('authToken');
  router.push('/ui/login');
}
export default request;
