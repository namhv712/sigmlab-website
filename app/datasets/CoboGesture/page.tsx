export const metadata = {
  title: 'CoboGesture Dataset',
}

export default function CoboGesturePage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">CoboGesture Dataset</h1>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>
          The dataset consists of 150 videos from 50 subjects, including 11 females and 39 males.
          Each video ranges from 100 seconds to 140 seconds in length and contains 2,479 gesture samples
          divided into 19 classes. The time interval between two gestures is approximately 4 seconds.
          In total, these 150 videos result in 490,000 RGB frames, corresponding to about 4.5 hours of video.
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <figure>
          <img
            src="/assets/images/datasets/CoboGesture/Faster1.gif"
            alt="Example of labeling the Faster gesture in CoboGesture dataset"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '500px' }}
          />
          <figcaption className="text-sm text-gray-500 text-center mt-2">
            Figure 1: Some samples of the Faster gesture in CoboGesture dataset
          </figcaption>
        </figure>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
        <p className="text-gray-700 mb-4">The detailed information for each class is provided below:</p>
        <div className="space-y-4">
          <figure>
            <img
              src="/assets/images/datasets/CoboGesture/Gesture_table.png"
              alt="Gesture Table"
              className="max-w-full rounded-xl shadow-sm"
              style={{ maxWidth: '800px' }}
            />
            <figcaption className="text-sm text-gray-500 mt-2">Table: Gesture class details</figcaption>
          </figure>
          <figure>
            <img
              src="/assets/images/datasets/CoboGesture/Gesture_char.png"
              alt="Dataset statistics"
              className="max-w-full rounded-xl shadow-sm"
              style={{ maxWidth: '800px' }}
            />
            <figcaption className="text-sm text-gray-500 mt-2">Figure: Statistics of the dataset</figcaption>
          </figure>
        </div>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Terms &amp; Conditions of Use</h2>
        <p className="text-gray-700">
          The datasets are released for academic research only, and are free to researchers from educational
          or research institutes for non-commercial purposes.
        </p>
      </div>

      <div className="section-card">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Download</h2>
        <p className="text-gray-700">
          The requestor must sign in the commitment and send it to the database administrator{' '}
          <a href="mailto:lan.lethi1@hust.edu.vn" className="text-blue-600 hover:underline">
            lan.lethi1@hust.edu.vn
          </a>{' '}
          by email.
        </p>
      </div>
    </div>
  )
}
