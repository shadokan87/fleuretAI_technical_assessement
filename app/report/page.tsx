"use client";

export default function ReportPage() {
  // For simplicity, hardcoding the known report IDs from the mock data
  const reports = ["report-001", "report-002", "report-003"];

  const handleReportClick = async (reportId: string) => {
    try {
      console.log(`[1] Fetching summary for ${reportId}...`);
      const summaryRes = await fetch(`/api/report?reportId=${reportId}`);
      if (!summaryRes.ok) {
        throw new Error("Failed to fetch report summary");
      }
      
      const summaryData = await summaryRes.json();
      console.log(`[2] Summary loaded. Fetching details for ${summaryData.vulnerabilities.length} vulnerabilities...`);
      
      // Fetch details for each vulnerability concurrently
      const detailPromises = summaryData.vulnerabilities.map(async (v: { id: string }) => {
        const detailRes = await fetch(`/api/vulnerabilities/${v.id}`);
        if (!detailRes.ok) return null;
        return detailRes.json();
      });

      const fullVulnerabilities = await Promise.all(detailPromises);
      
      console.log(`=== Full Vulnerability Details for ${reportId} ===`);
      console.log(fullVulnerabilities);
      
    } catch (error) {
      console.error("Error loading report data:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Available Reports</h1>
      <p className="text-gray-600 mb-6">Click a report to fetch its vulnerabilities and log them in the console.</p>
      
      <ul className="space-y-4">
        {reports.map((id) => (
          <li key={id}>
            <button 
              onClick={() => handleReportClick(id)}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded shadow hover:bg-blue-700 transition"
            >
              Load {id}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
