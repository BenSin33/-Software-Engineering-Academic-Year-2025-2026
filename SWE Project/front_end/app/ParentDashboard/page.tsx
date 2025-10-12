export default function ParentDashboardPage() {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome, Parent 👋</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">Bus Status</h2>
            <p>Bus #12A is currently <b>On the Way</b> to school.</p>
          </div>
  
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">Next Stop</h2>
            <p>Arriving at your home in <b>3 minutes</b>.</p>
          </div>
  
          <div className="bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">Last Notification</h2>
            <p>Bus departed from station at 7:10 AM.</p>
          </div>
        </div>
      </div>
    );
  }
  