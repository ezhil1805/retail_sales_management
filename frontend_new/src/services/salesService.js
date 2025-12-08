const API_URL = "http://localhost:5000/api/sales"; // backend endpoint

export async function fetchSales(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}?${query}`);
  return response.json();
}
