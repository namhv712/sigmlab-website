export const metadata = {
  title: 'Ovarian Tumor Dataset',
}

export default function OvarianPage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">The Ovarian Tumor Dataset (OvaTUS)</h1>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Introduction</h2>
        <p className="text-gray-700 text-justify">
          The OvaTUS dataset was collected by the research team of the Signal, Information, and Multimedia
          Content Processing Laboratory (SigM Lab) in collaboration with the National Hospital of Obstetrics
          and Gynecology (NHOG) in Hanoi, Vietnam, as part of grant number KC-4.0-45/19-25 &quot;Research and
          development of a computer-aided support system for ovarian cancer diagnosis using ultrasound images&quot;.
          This dataset comprises ultrasound images from women who visited the hospital for ovarian tumor
          assessment and consented to participate in the study.
        </p>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">A. Data Collection</h2>
        <p className="text-gray-700 text-justify mb-4">
          We introduce OvaTUS-V1, the first official release of our ovarian tumor ultrasound image dataset.
          This dataset is developed following a standardized pipeline for data collection, storage, and
          annotation, ensuring consistency and reliability across all samples. The process of collecting:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>We recruit volunteers aged 20–70, inform them about the study, and obtain their consent to use their medical results.</li>
          <li>Patients undergo preoperative CA125 and HE4 biomarker testing, along with ultrasound imaging.</li>
          <li>Patients with functional ovarian cysts, pregnancy, end-stage renal failure, or a history of organ transplantation are excluded.</li>
          <li>Surgery and postoperative histopathological analysis confirm the tumor&apos;s final diagnosis.</li>
          <li>We apply techniques to remove markers, and patients&apos; personal data, as well as control the quality of the images before annotation.</li>
        </ol>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">B. Collection and Storage Process</h2>
        <p className="text-gray-700 text-justify">
          The dataset was collected at the National Hospital of Obstetrics and Gynecology (NHOG) in Hanoi, Vietnam.
          The majority of ultrasound images were acquired using two commonly deployed diagnostic imaging systems:
          the Samsung Medison W80i and the GE Voluson S6. Images are saved in DICOM, PNG, and JPEG formats.
        </p>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">C. Data Pre-processing and Annotation</h2>
        <p className="text-gray-700 text-justify mb-4">
          The captured images undergo pre-processing before annotation. This includes removing personal data
          and eliminating markers added by doctors during ultrasound imaging. Doctors classified tumors following
          IOTA standards into 6 types. Number of samples per class in OvaTUS-V1:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2">No.</th>
                <th className="border border-gray-300 px-3 py-2">Category</th>
                <th className="border border-gray-300 px-3 py-2">Description</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Images</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['1', 'Solid tumor', 'A tumor with a cystic structure with only one lobe, without septa, solid tissue, or buds.', '65'],
                ['2', 'Multilobular cyst', 'A cyst with at least one septation and no solid components or papillary projections.', '137'],
                ['3', 'Unilocular cyst', 'A tumor with a cystic structure with only one lobe, but with the presence of a solid part or at least one bud.', '76'],
                ['4', 'Dermoid cyst', 'Cyst with a solid appearance and thin walls, typically unilocular and exhibiting a ground-glass pattern.', '100'],
                ['5', 'Multilobular-solid cyst', 'A single-locule ovarian cyst that contains a solid component or at least one papillary projection within its structure.', '36'],
                ['6', 'Unilocular-solid cyst', 'A cyst with a single locule and a solid component or at least one papillary projection.', '25'],
              ].map(([no, cat, desc, num], i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-center">{no}</td>
                  <td className="border border-gray-300 px-3 py-2 font-medium">{cat}</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm">{desc}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{num}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">E. Data Analysis</h2>
        <p className="text-gray-700 text-justify mb-4">
          In all datasets, the annotated tumor regions exhibit high variability in size, shape, and texture,
          reflecting the diverse nature of ovarian tumors.
        </p>
        <div className="flex justify-center mb-4">
          <img src="/assets/images/datasets/OvarianTumor/OvaSize.jpg" alt="OvaTUS Image Size" className="max-w-full rounded-xl shadow-sm" style={{maxWidth: '80%'}} />
        </div>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">H. Sample Images</h2>
        <div className="flex justify-center">
          <img src="/assets/images/datasets/OvarianTumor/ovt.png" alt="OvaTUS Dataset Samples" className="max-w-full rounded-xl shadow-sm" style={{maxWidth: '80%'}} />
        </div>
      </div>
    </div>
  )
}
