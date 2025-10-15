export const protectedFetch = async (
  url: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
) => {
  const token = await getToken();

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
};
