export const metadata = {
  title: 'Projects',
}

export default function ProjectsPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Active Projects</h1>

      {/* Ongoing Projects */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-3">
          <i className="fas fa-hourglass-half"></i>
          Ongoing Projects
        </h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border-l-4 border-red-600 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              HUST-funded project: &quot;Research and develop a method for detecting beehive anomalies from images captured at the hive entrance&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Code:</span> T2024-PC-044 &middot;
              <span className="ml-2 font-medium">Period:</span> 2024–2026
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-red-600 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              National KC 4.0 project: &quot;Research, design and manufacture of Cobot applied in industry and other fields with human–robot interaction&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Code:</span> KC-4.0-35/19-35 &middot;
              <span className="ml-2 font-medium">Period:</span> 2022–2024 &middot;
              <span className="ml-2 italic">Hand gesture recognition</span>
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-red-600 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              VLIR SI project: &quot;DORA: Open Drone Data Platform for Biodiversity Mapping&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Partners:</span> UGhent (Belgium) – VNUF (Vietnam) &middot;
              <span className="ml-2 font-medium">Period:</span> 2023–2025
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-red-600 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              MOET-funded project: &quot;Research and develop a driver monitoring system (DMS) based on intelligent edge computing on specialized hardware&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Period:</span> 2024–2025
            </p>
          </div>
        </div>
      </div>

      {/* Finished Projects */}
      <div>
        <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-3">
          <i className="fas fa-check-circle"></i>
          Finished Projects
        </h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl border-l-4 border-green-500 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              AFORS project: &quot;Communication-efficient and client selection for federated learning with label noise correction&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Partner:</span> Toulon University
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-green-500 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              ANR project: &quot;Cham Documentation – CHAMDOC&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Partners:</span> Paris – La Rochelle – HUST – Ottawa
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-green-500 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              National KC 4.0 project: &quot;Industry 4.0 technologies for honey bee production management&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Period:</span> 2022–2024 &middot;
              <span className="ml-2 italic">Image-based detection, tracking &amp; behavior analysis</span>
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-green-500 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              MOET-funded project: &quot;Deep learning for simultaneous sound and image separation from videos&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Period:</span> 2023–2024
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-green-500 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              National KC 4.0 project: &quot;Applied AI for ultrasound imaging supporting ovarian cancer diagnosis in Vietnam&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Period:</span> 2022–2024
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-green-500 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              MOET-funded project: &quot;Building atlas and plant traceability tools for pollen and honeybee&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Period:</span> 2023–2024
            </p>
          </div>

          <div className="bg-white rounded-xl border-l-4 border-green-500 p-5 shadow-sm">
            <p className="font-semibold text-gray-800 text-lg mb-2">
              MOET-funded project: &quot;AI-based multimodal system for traumatic brain injury prognosis&quot;
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Period:</span> 2023–2024
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
