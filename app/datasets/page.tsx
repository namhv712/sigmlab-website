import Link from 'next/link'

export const metadata = {
  title: 'Datasets',
}

export default function DatasetsPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">Datasets</h1>

      {/* Forestry & Environment */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i className="fas fa-leaf text-green-600"></i>
          Forestry &amp; Environment
        </h2>
        <div className="space-y-5">
          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/ForestSeg/Tree.png" alt="ForestSeg Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/ForestSeg" className="text-red-700 hover:underline">Forest Segmentation Dataset</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2025)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                ForestSeg-T1 contains 1,832 high-resolution UAV images captured in multi-seasonal conditions for tree crown segmentation, supporting forest monitoring and long-term environmental analysis.
              </p>
              <Link href="/datasets/ForestSeg" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>

          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/VietForest/VietForest.png" alt="VietForest Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/VietForest" className="text-red-700 hover:underline">VietForest Dataset</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2024)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                VietForest comprises 26,251 images of 156 Vietnamese plant species, covering 18 orders, 45 families, and 122 genera, supporting biodiversity analysis and conservation research.
              </p>
              <Link href="/datasets/VietForest" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Imaging */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i className="fas fa-heartbeat text-red-600"></i>
          Medical Imaging
        </h2>
        <div className="space-y-5">
          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/OvarianTumor/OvaTUS.png" alt="OvaTUS Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/Ovarian" className="text-red-700 hover:underline">Ovarian Tumor Dataset (OvaTUS)</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2025)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                OvaTUS is an ultrasound dataset collected in collaboration with NHOG, Hanoi, containing six annotated ovarian tumor categories for diagnosis and segmentation research.
              </p>
              <Link href="/datasets/Ovarian" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Human Activity & Gesture */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i className="fas fa-user text-purple-600"></i>
          Human Activity &amp; Gesture
        </h2>
        <div className="space-y-5">
          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/CoboGesture/s7_TranVanThang_2_35_38.gif" alt="CoboGesture Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/CoboGesture" className="text-red-700 hover:underline">CoboGesture Dataset</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2024)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                CoboGesture contains 150 long-duration videos from 50 subjects, annotated into 19 gesture classes, designed for continuous gesture recognition research.
              </p>
              <Link href="/datasets/CoboGesture" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>

          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/CStudentAct/CStudentAct.jpg" alt="CStudentAct Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/CStudentAct" className="text-red-700 hover:underline">CStudentAct Dataset</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2024)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                CStudentAct is a continuous student activity recognition dataset extending StudentAct, supporting fine-grained temporal annotation and classroom behavior analysis.
              </p>
              <Link href="/datasets/CStudentAct" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>

          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/StudentAct/CameraSetting.png" alt="StudentAct Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/StudentAct" className="text-red-700 hover:underline">StudentAct Dataset</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2021)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                StudentAct is a benchmark dataset for human activity recognition in classroom environments, supporting detection, tracking, and activity classification.
              </p>
              <Link href="/datasets/StudentAct" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tracking & Re-identification */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i className="fas fa-camera text-blue-600"></i>
          Tracking &amp; Re-identification
        </h2>
        <div className="space-y-5">
          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/VnBeeTracking/annotation.png" alt="VnBeeTracking Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/VnBeeTracking" className="text-red-700 hover:underline">VnBeeTracking Dataset</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2023)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                VnBeeTracking provides annotated videos captured at beehive entrances, supporting honeybee detection, tracking, and behavior analysis under real-world conditions.
              </p>
              <Link href="/datasets/VnBeeTracking" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>

          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/pollenbee/video_dataset.gif" alt="VnPollenBee Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/pollenbee" className="text-red-700 hover:underline">VnPollenBee Dataset</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2022)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                VnPollenBee is designed for pollen-bearing bee detection, containing over 60,000 labeled samples collected using an edge-based acquisition system.
              </p>
              <Link href="/datasets/pollenbee" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>

          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/VnPersonSearch3000/VnPersonSearch3000.jpg" alt="VnPersonSearch3000 Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/VnPersonSearch3000" className="text-red-700 hover:underline">VnPersonSearch3000</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2021)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                VnPersonSearch3000 includes image-description pairs for person search tasks, collected in crowded outdoor environments under diverse lighting conditions.
              </p>
              <Link href="/datasets/VnPersonSearch3000" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>

          <div className="section-card flex flex-col md:flex-row gap-6">
            <div className="md:w-56 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-40">
              <img src="/assets/images/datasets/FAPR.jpg" alt="FAPR Dataset" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                <Link href="/datasets/FAPR" className="text-red-700 hover:underline">Fully Automated Person ReID (FAPR)</Link>
                <span className="text-gray-400 font-normal text-sm ml-2">(2020)</span>
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                FAPR contains multi-camera videos recorded in indoor and outdoor environments, supporting detection, tracking, and person re-identification research.
              </p>
              <Link href="/datasets/FAPR" className="text-blue-600 font-semibold text-sm hover:underline">View dataset →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
