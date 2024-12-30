import router from '@/router';
import { inject } from 'vue';

async function request(
  pages: string,
  method: RequestInit['method'] = 'get',
  body = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ status: number; body: Record<string, any> } | void> {
  const apiLink = inject('apiLink') as string;
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
  router.push('/login');
}
export default request;
