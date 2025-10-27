// app/API/routeService.ts
export async function fetchRouteService() {
    try {
      const response = await fetch('http://localhost:3000/api/route_service', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Lỗi khi gọi API');
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Lỗi routeService:', error);
      return null;
    }
  }