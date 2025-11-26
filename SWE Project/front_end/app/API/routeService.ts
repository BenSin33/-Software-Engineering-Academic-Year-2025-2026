// app/API/routeService.ts
const BASE_URL = process.env.ROUTE_API_URL || 'http://localhost:5000';

export async function fetchRouteService() {
  try {
    const response = await fetch(`${BASE_URL}/routes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) throw new Error('Lỗi khi gọi API');

    return await response.json();
  } catch (error) {
    console.error('Lỗi routeService:', error);
    return null;
  }
}
