export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchJson = async (
  path: string,
  options: RequestInit = {}
): Promise<any> => {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  options.headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  options.credentials = "include";

  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Redirect to login page if token is not valid
      // if not on login or signup page, redirect to login page
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        window.location.href = "/login";
      }
      return; // Prevent further execution
    }

    const error = await response.json();
    throw new Error(error.message || "Network response was not ok");
  }
  return response.json();
};
