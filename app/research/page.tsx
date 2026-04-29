export const metadata = {
  title: 'Research',
}

export default function ResearchPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Research Topics</h1>

      <div className="space-y-8">
        {/* Direction 1 */}
        <div className="bg-white rounded-2xl shadow-sm border-l-8 border-blue-500 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Research Direction 1: Nonlinear Signal Processing
          </h2>
          <p className="text-gray-500 mb-5 text-base">
            Responsible: <strong className="text-gray-700">Assoc. Prof. Manh-Thang Hoang</strong>
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <img
              src="/assets/images/team/Permanent Members/Main - Thầy Thắng.png"
              alt="Assoc. Prof. Manh-Thang Hoang"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
            <img
              src="/assets/images/team/Permanent Members/Main - Thầy Dũng.png"
              alt="Assoc. Prof. Tien-Dung Nguyen"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
          </div>
          <ul className="space-y-2 text-gray-700 list-disc list-inside text-base leading-relaxed">
            <li>Nonlinear time series analysis and statistical signal processing</li>
            <li>Analysis of complex systems, network structures, and EEG signal classification</li>
            <li>Chaos-based cryptography and image encryption</li>
          </ul>
        </div>

        {/* Direction 2 */}
        <div className="bg-white rounded-2xl shadow-sm border-l-8 border-red-600 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Research Direction 2: Multimedia Analysis
          </h2>
          <p className="text-gray-500 mb-5 text-base">
            Responsible: <strong className="text-gray-700">Assoc. Prof. Thi-Lan Le</strong>
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <img
              src="/assets/images/team/Permanent Members/Main - Cô Lan.png"
              alt="Assoc. Prof. Thi-Lan Le"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
            <img
              src="/assets/images/team/Permanent Members/Main - Cô Hải.png"
              alt="Assoc. Prof. Thanh-Hai Tran"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
            <img
              src="/assets/images/team/Permanent Members/Main - Thầy Hải.png"
              alt="Assoc. Prof. Hai Vu"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
            <img
              src="/assets/images/team/Permanent Members/Main - Cô Diệp.png"
              alt="Dr. Thi Ngoc Diep Do"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
            <img
              src="/assets/images/team/Permanent Members/Main - Thầy Dũng.png"
              alt="Assoc. Prof. Tien-Dung Nguyen"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
          </div>
          <ul className="space-y-2 text-gray-700 list-disc list-inside text-base leading-relaxed">
            <li>Deep learning–based multimedia analysis</li>
            <li>Multi-modal correlation and fusion</li>
            <li>Neural network optimization on edge devices</li>
            <li>Context-aware analysis from wearable and environmental sensors</li>
          </ul>
        </div>

        {/* Direction 3 */}
        <div className="bg-white rounded-2xl shadow-sm border-l-8 border-green-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Research Direction 3: Confidentiality and Integrity for Multimedia
          </h2>
          <p className="text-gray-500 mb-5 text-base">
            Responsible: <strong className="text-gray-700">Dr. Kim-Hue Ta</strong>
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <img
              src="/assets/images/team/Permanent Members/Main - Cô Huệ.png"
              alt="Dr. Kim-Hue Ta"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
            <img
              src="/assets/images/team/Permanent Members/Main - Thầy Thắng.png"
              alt="Assoc. Prof. Manh-Thang Hoang"
              className="w-16 h-16 object-cover border-2 border-gray-200 rounded"
            />
          </div>
          <ul className="space-y-2 text-gray-700 list-disc list-inside text-base leading-relaxed">
            <li>Attribute-Based Encryption</li>
            <li>Zero-Knowledge Proofs for information security</li>
            <li>Blockchain technologies and applications</li>
            <li>Complex networks in decentralized consensus mechanisms</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
