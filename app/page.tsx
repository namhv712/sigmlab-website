export default function Home() {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-800 mb-6 leading-tight">
          Signal Processing, Information and Multimedia Content
        </h1>
        <div className="max-w-3xl mx-auto text-lg text-gray-700 space-y-4 text-justify">
          <p>
            <strong>SigM</strong> is a dynamic laboratory specializing in research and education within the field of
            multimedia signal processing.
          </p>
          <p>
            Research topics span over three highly interconnected disciplines of multimedia signal processing,
            namely non-linear signal processing, multimodal analysis and interpretation, and media security.
          </p>
        </div>
      </div>

      {/* Banner Image */}
      <div className="mb-12 rounded-2xl overflow-hidden shadow-md">
        <img
          src="/assets/images/banner/overview.png"
          alt="SigM Lab Overview"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        {/* Card: PhD Day 2026 */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 transform">
          <div
            className="relative h-40 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/images/notification/PhD-Day_Th1-2026.jpg')" }}
          >
            <div className="absolute bottom-3 right-4 bg-gray-600 text-white text-center px-3 py-2 rounded-lg">
              <span className="block text-lg font-bold">04</span>
              <span className="block text-xs">Feb 2026</span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 mb-2">PhD Students Day 2026</h3>
            <p className="text-sm text-gray-600"><span className="text-red-700 font-semibold">Time:</span> 08:00 AM - 04/02/2026</p>
            <p className="text-sm text-gray-600"><span className="text-red-700 font-semibold">Address:</span> Room E.803 - C7 Building, HUST</p>
          </div>
        </div>

        {/* Card: Happy New Year 2026 */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 transform">
          <div
            className="relative h-40 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/images/notification/2026.jpg')" }}
          >
            <div className="absolute bottom-3 right-4 bg-gray-600 text-white text-center px-3 py-2 rounded-lg">
              <span className="block text-lg font-bold">01</span>
              <span className="block text-xs">Jan 2026</span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-semibold text-red-700 mb-2">Happy New Year 2026</h3>
          </div>
        </div>

        {/* Card: MAPR 2025 */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 hover:-translate-y-1 transform">
          <div
            className="relative h-40 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/images/notification/MAPR2025.png')" }}
          >
            <div className="absolute bottom-3 right-4 bg-gray-600 text-white text-center px-3 py-2 rounded-lg">
              <span className="block text-lg font-bold">14</span>
              <span className="block text-xs">Aug 2025</span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 mb-2">MAPR 2025</h3>
            <p className="text-sm text-gray-600"><span className="text-red-700 font-semibold">Time:</span> 8:00 AM - 15/08/2025</p>
            <p className="text-sm text-gray-600"><span className="text-red-700 font-semibold">Address:</span> Nha Trang, Viet Nam.</p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Notifications</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Notification Feed */}
        <div className="flex-1 max-h-[520px] overflow-y-auto pr-2 space-y-4">

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-graduation-cap text-lg"></i>
              <span>PhD Students Day 2026</span>
            </div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Annual reporting day.</li>
              <li><strong>Date:</strong> February 04, 2026</li>
              <li><strong>Venue:</strong> Room E.803, C7 Building, Hanoi University of Science and Technology (HUST)</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-graduation-cap text-lg"></i>
              <span>Master&apos;s Thesis Defense – Duy-Tung Nguyen</span>
            </div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Master&apos;s student <strong>Duy-Tung Nguyen</strong> defended his master&apos;s thesis entitled <strong>&quot;Assessing the Generalization Ability of Machine Learning Models Using Generative Models, with Application to Multi-Object Tracking&quot;</strong>.</li>
              <li><strong>Date:</strong> January 12, 2026</li>
              <li><strong>Venue:</strong> Room E.615, C7 Building, HUST</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-user-graduate text-lg"></i>
              <span>PhD Dissertation Proposal Defense – Trung-Hieu Le</span>
            </div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>PhD student <strong>Trung-Hieu Le</strong> defended his doctoral dissertation proposal entitled <strong>&quot;Activity Recognition Based on the Combination of Accelerometers and Vision&quot;</strong>.</li>
              <li><strong>Date:</strong> December 29, 2025</li>
              <li><strong>Venue:</strong> Room C1.317, C1 Building, HUST</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-graduation-cap text-lg"></i>
              <span>Master&apos;s Thesis Defense – Hoang-Son Bui</span>
            </div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Master&apos;s student <strong>Hoang-Son Bui</strong> defended his master&apos;s thesis entitled <strong>&quot;Ovarian Tumor Segmentation and Morphological Extraction from Ultrasound Images&quot;</strong>.</li>
              <li><strong>Date:</strong> November 13, 2025</li>
              <li><strong>Venue:</strong> Room E.613, C7 Building, HUST</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-user-graduate text-lg"></i>
              <span>PhD Dissertation Proposal Defense – Phuong-Dung Nguyen</span>
            </div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>PhD student <strong>Phuong-Dung Nguyen</strong> defended her doctoral dissertation proposal entitled <strong>&quot;Student Activity Recognition from Classroom Videos&quot;</strong>.</li>
              <li><strong>Date:</strong> September 29, 2025</li>
              <li><strong>Venue:</strong> Room C1.317, C1 Building, HUST</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-bullhorn text-lg"></i>
              <a href="https://mapr.uit.edu.vn/" className="hover:underline">
                The 8th International Conference on Multimedia Analysis and Pattern Recognition (MAPR 2025) – Nha Trang, Vietnam
              </a>
            </div>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>The conference will be held on <strong>August 14–15, 2025</strong>.</li>
              <li><strong>Important Dates:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Submission: <del>May 01, 2025</del> <strong>May 15, 2025</strong></li>
                  <li>Acceptance: <strong>Jul 01, 2025</strong></li>
                  <li>Camera Ready: <strong>Jul 07, 2025</strong></li>
                  <li>Registration: <strong>Jul 07, 2025</strong></li>
                </ul>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-award text-lg"></i>
              <span>SigM Lab student won 2nd Prize at the Hackathon Harvard Health System 2025</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Congratulations to <strong>Team VitalSense</strong> for winning Second Prize at the Hackathon: <em>Building High Value Health Systems Through AI</em>.</p>
              <p>Project: <strong>Applying AI for Early Screening and Progress Monitoring of Neurodevelopmental Disorders in Children</strong>.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-calendar-check text-lg"></i>
              <span>PhD Student Day 2024</span>
            </div>
            <p className="text-sm text-gray-600">
              Annual reporting day on <strong>December 20, 2024</strong>, Room <strong>E.803 – C7 Building</strong>, Hanoi University of Science and Technology.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:-translate-y-1 transform transition-transform duration-200">
            <div className="flex items-center gap-3 font-bold text-red-700 mb-3">
              <i className="fas fa-trophy text-lg"></i>
              <a href="https://densohackathon.com/home" className="hover:underline">
                ETTN K67 Students win The Denso Factory Hackathons 2024
              </a>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Congratulations to ETTN K67 students under the guidance of <strong>Dr. Kim-Hue Ta</strong> with project:</p>
              <p><strong>Deploying Fog-Based AIoT Platform for CNC Machine Monitoring</strong>.</p>
            </div>
          </div>

        </div>

        {/* Side Image */}
        <div className="lg:w-64 flex-shrink-0">
          <img
            src="/assets/images/about/Lab20-11.jpg"
            alt="Lab Image"
            className="w-full rounded-2xl shadow-md"
          />
        </div>
      </div>
    </div>
  )
}
