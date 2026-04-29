export const metadata = {
  title: 'VnBeeTracking Dataset',
}

export default function VnBeeTrackingPage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">The VnBeeTracking Dataset</h1>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>The VnBeeTracking Dataset is built for the purpose of serving the tracking honeybee problem.</p>
        <p>
          The videos in the dataset are collected at the beehive entrance at the Research Center for Tropical
          Bees and Beekeeping, Vietnam National University of Agriculture in April 2022.
        </p>
        <p>
          We used a data acquisition system consisting of an Nvidia jetson nano development kit and an
          IMX477 HQ camera with a 6mm CS-Mount lens placed in a housing surveillance weatherproof outdoor
          camera box.
        </p>
      </div>

      <div className="mb-6">
        <img
          src="/assets/images/datasets/pollenbee/system.PNG"
          alt="Data acquisition system"
          className="max-w-full rounded-xl shadow-sm"
          style={{ maxWidth: '850px' }}
        />
      </div>

      <div className="mb-6">
        <p className="text-gray-700 mb-3">Example of video collected by our data acquisition system:</p>
        <video controls autoPlay className="max-w-full rounded-xl shadow-sm">
          <source src="/assets/images/datasets/VnBeeTracking/2022-04-08-12-30.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
        <p className="text-gray-700 text-justify mb-4">
          5 videos recorded on mornings of different days were selected to build the dataset. These videos are
          recorded in 1080×720 resolution at 60 fps. We extracted frames from the first 10 seconds of each video,
          so the total number of frames extracted from all 5 videos is 3,000 frames. As a result, 252 IDs and
          28,223 bounding boxes were annotated.
        </p>

        <figure className="mb-6">
          <img
            src="/assets/images/datasets/VnBeeTracking/annotation.png"
            alt="Annotation"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '800px' }}
          />
          <figcaption className="text-sm text-gray-500 mt-2">An example of a frame with labeled honeybees</figcaption>
        </figure>

        <p className="font-semibold text-gray-800 mb-3">Detailed statistics of VnBeeTracking dataset:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                {['Video', 'Fs', 'IDs', 'BBs', 'Max IDs', 'Min IDs', 'Avg IDs', 'Max Fs', 'Avg Fs'].map(h => (
                  <th key={h} className="border border-gray-300 px-3 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Video1', '600', '25', '5,416', '11', '7', '9', '600', '217'],
                ['Video2', '600', '48', '2,399', '8', '1', '4', '129', '50'],
                ['Video3', '600', '44', '2,955', '9', '2', '5', '599', '67'],
                ['Video4', '600', '67', '7,450', '17', '6', '12', '600', '113'],
                ['Video5', '600', '68', '10,003', '24', '12', '17', '600', '147'],
              ].map((row, i) => (
                <tr key={i} className="even:bg-gray-50">
                  {row.map((cell, j) => (
                    <td key={j} className="border border-gray-300 px-3 py-2">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p><strong>Fs</strong> – number of frames in each video</p>
          <p><strong>IDs</strong> – number of IDs in each video</p>
          <p><strong>BBs</strong> – number of bounding boxes in each video</p>
          <p><strong>Max_IDs</strong> – maximum number of IDs per frame</p>
          <p><strong>Min_IDs</strong> – minimum number of IDs per frame</p>
          <p><strong>Avg_IDs</strong> – average number of IDs per frame</p>
          <p><strong>Max_Fs</strong> – maximum number of frames in which an ID appears</p>
          <p><strong>Avg_Fs</strong> – average number of frames in which an ID appears</p>
        </div>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Terms &amp; Conditions of Use</h2>
        <p className="text-gray-700">
          The datasets are released for academic research only, and are free to researchers from educational
          or research institutes for non-commercial purposes.
        </p>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Related Publications</h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-2">
          <li>
            Le, T. N., Tran, D. N., Phan, T. T. H., Pham, H. T., Le, T. L., &amp; Vu, H. (2023, October).{' '}
            <em>A robust multiple honeybee tracking method from videos captured at beehive entrance.</em>{' '}
            In 2023 International Conference on Multimedia Analysis and Pattern Recognition (MAPR) (pp. 1-6). IEEE.
          </li>
        </ol>
      </div>

      <div className="section-card">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Download</h2>
        <p className="text-gray-700">
          The dataset can be downloaded{' '}
          <a
            href="https://drive.google.com/drive/folders/1m8E-RIRFznhRERB0vDTcxj1ow_rfgbEv?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            here
          </a>.{' '}
          5 original videos are placed in the folder named &apos;OrginalVideo&apos;. The frames are extracted from the
          first 10s of each video. The results of merging .txt files of each video are placed in the folder
          named &apos;GroundTruth&apos;.
        </p>
      </div>
    </div>
  )
}
