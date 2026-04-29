export const metadata = {
  title: 'FAPR Dataset',
}

export default function FAPRPage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Fully Automated Person ReID (FAPR)</h1>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>
          In this study, a dataset is built by our own for evaluating the performance of each step in the
          fully automated person ReID system, called Fully Automated Person ReID (FAPR) dataset. This dataset
          contains total 15 videos and is recorded on three days by two static non-overlapping cameras with
          HD resolution (1920 × 1080), at 20 frames per second (fps) in indoor and outdoor environment conditions.
        </p>
        <p>
          Due to the limitation of observation environment, the distances from pedestrians to cameras range from
          about 2 meters to 8 meters. The blurred phenomenon also causes difficulty for human detection as well
          as tracking steps. This dataset is captured in both indoor and outdoor environments.
        </p>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
        <p className="font-semibold text-gray-800 mb-3">Detailed statistics of FAPR dataset:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left">Videos</th>
                <th className="border border-gray-300 px-3 py-2 text-center">#Image</th>
                <th className="border border-gray-300 px-3 py-2 text-center">#Bounding boxes</th>
                <th className="border border-gray-300 px-3 py-2 text-center">#BB/Image</th>
                <th className="border border-gray-300 px-3 py-2 text-center">#IDs</th>
                <th className="border border-gray-300 px-3 py-2 text-center">#Tracklets</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['indoor', '489', '1153', '2.36', '7', '7'],
                ['outdoor easy', '1499', '2563', '1.71', '6', '7'],
                ['outdoor hard', '2702', '6552', '2.42', '8', '20'],
                ['20191104 indoor_left', '363', '1287', '3.55', '10', '10'],
                ['20191104 indoor_right', '440', '1266', '2.88', '10', '13'],
                ['20191104 indoor_cross', '240', '1056', '4.40', '10', '10'],
                ['20191104_outdoor_left', '449', '1333', '2.97', '10', '10'],
                ['20191104_outdoor_right', '382', '1406', '3.68', '10', '11'],
                ['20191104 outdoor_cross', '200', '939', '4.70', '10', '12'],
                ['20191105 indoor_left', '947', '1502', '1.59', '10', '11'],
                ['20191105 indoor_right', '474', '1119', '2.36', '10', '10'],
                ['20191105 indoor_cross', '1447', '3087', '2.13', '10', '21'],
                ['20191105_outdoor_left', '765', '1565', '2.05', '11', '11'],
                ['20191105 outdoor_right', '470', '1119', '2.38', '10', '11'],
                ['20191105 outdoor_cross', '1009', '2620', '2.60', '9', '17'],
              ].map((row, i) => (
                <tr key={i} className="even:bg-gray-50">
                  {row.map((cell, j) => (
                    <td key={j} className={`border border-gray-300 px-3 py-2 ${j === 0 ? 'text-left' : 'text-center'}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
        <ol className="list-decimal list-inside text-gray-700 space-y-3">
          <li>
            Hong-Quan Nguyen, Thuy-Binh Nguyen, Duc-Long Tran, Thi-Lan Le.{' '}
            <em>A UNIFIED FRAMEWORK FOR AUTOMATED PERSON RE-IDENTIFICATION.</em>{' '}
            Transport and Communications Science Journal, Vol. 71, Issue 7 (09/2020), 868-880.
          </li>
          <li>
            Nguyen, Hong-Quan, Thuy-Binh Nguyen, T. A. Le, Thi-Lan Le, Thanh-Hai Vu, and Alexis Noe.{' '}
            <em>Comparative evaluation of human detection and tracking approaches for online tracking applications.</em>{' '}
            In 2019 International Conference on Advanced Technologies for Communications (ATC), IEEE, pp. 348-353. 2019.
          </li>
        </ol>
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
