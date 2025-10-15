export async function login(username: string, password: string){
    const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST', 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username, password})
    });

    const data = await res.json();

    if(!res.ok){
        throw new Error(data.error || "Đăng nhập thất bại");
    }

    return data;
}