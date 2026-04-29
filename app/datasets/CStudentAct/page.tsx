export const metadata = {
  title: 'CStudentAct Dataset',
}

export default function CStudentActPage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">CStudentAct Dataset</h1>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>
          Although several image and video datasets have been collected for student activity recognition,
          they are mainly annotated at the frame level or sequence level. To promote research in continuous
          student activity recognition, we have prepared a new dataset named CStudentAct.
          The CStudentAct Dataset is an extension of the StudentAct Dataset. It provides both temporal and
          spatial information for each activity.
        </p>
      </div>

      <div className="mb-6">
        <figure>
          <img
            src="/assets/images/datasets/CStudentAct/CStudentAct.jpg"
            alt="Example of labeling the raising hand activity sequence in CStudentAct dataset"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '700px' }}
          />
          <figcaption className="text-sm text-gray-500 mt-2">
            Figure 1: Example of labeling the raising hand activity sequence in CStudentAct dataset
          </figcaption>
        </figure>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
        <p className="text-gray-700 mb-3">Each labeled data sample includes the following information:</p>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          <li>Activity type</li>
          <li>Action instances</li>
          <li>Bounding boxes of the activity in each frame of interest</li>
        </ul>
        <p className="text-gray-700 text-justify mb-4">
          In this dataset, action instances are defined as the names of dynamic activity sequences of students
          in the classroom. The same person can have multiple action instances.
        </p>
        <figure className="mb-4">
          <img
            src="/assets/images/datasets/CStudentAct/activity_sequences.jpg"
            alt="Activity sequences"
            className="max-w-full rounded-xl shadow-sm"
          />
          <figcaption className="text-sm text-gray-500 mt-2">
            Figure 2: Examples of activity sequences: (a) raising hand, (b) standing, (c) sleeping, (d) using phone
          </figcaption>
        </figure>

        <figure className="mb-6">
          <img
            src="/assets/images/datasets/CStudentAct/label.jpg"
            alt="File structure stores labeled results"
            className="max-w-full rounded-xl shadow-sm"
          />
        </figure>

        <p className="text-gray-700 mb-4">Table 1: Statistics of CStudentAct dataset:</p>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Activity</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Number of images</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Number of act_ins</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Number of bbox</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Raising_hand', '296', '39', '3991'],
                ['Using_phone', '3125', '26', '11998'],
                ['Sleeping', '3313', '31', '10162'],
                ['Standing', '4623', '46', '6626'],
              ].map(([act, img, ins, bb], i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{act}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{img}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{ins}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{bb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Usage Terms</h2>
        <p className="text-gray-700 mb-3">
          The Hanoi University of Science and Technology (HUST) has copyright in the collection of activity
          video and associated data and serves as a distributor of the CStudentAct dataset.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Redistribution:</strong> Without prior written approval from the dataset administrator, the CStudentAct dataset will not be further distributed, published, copied, or disseminated.</li>
          <li><strong>Modification and Commercial Use:</strong> The dataset may not be modified or used for commercial purposes.</li>
          <li><strong>Publication Requirements:</strong> Still frames or video must not be used in any way that could cause the original subject embarrassment or mental anguish.</li>
        </ul>
      </div>

      <div className="section-card">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Download</h2>
        <p className="text-gray-700">
          The requestor must sign in the commitment and send it to the dataset administrator{' '}
          <a href="mailto:lan.lethi1@hust.edu.vn" className="text-blue-600 hover:underline">
            lan.lethi1@hust.edu.vn
          </a>{' '}
          by email.
        </p>
      </div>
    </div>
  )
}
