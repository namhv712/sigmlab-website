export const metadata = {
  title: 'VietForest Dataset',
}

export default function VietForestPage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">The VietForest Dataset</h1>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>
          Our Vietnamese forestry dataset (VietForest) is a valuable resource comprising 156 classes of plant
          species predominantly found in the forests of Phu Tho province. This dataset encompasses a diverse
          range of flora, including 18 orders, 45 families, and 122 genera, totaling 26,251 images. The dataset
          showcases local plant species, many of which hold significant ecological importance and some of which
          are listed for conservation efforts.
        </p>
        <p>The pictures in the dataset are taken in Phu Tho province in 2023.</p>
      </div>

      <div className="flex justify-center mb-8">
        <img src="/assets/images/datasets/VietForest/VietForest.png" alt="VietForest Dataset" className="max-w-full rounded-xl shadow-sm" style={{maxWidth: '850px'}} />
      </div>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
        <p className="text-gray-700 mb-4 text-justify">
          We trained multiple network structures, including ResNet50, DenseNet169, SENet-154, and Vision
          Transformer B-16, on two plant datasets. All networks were trained with a batch size of 32, 30 epochs,
          SGD optimizer with learning rate 0.001, momentum 0.9, and weight decay 5e-04.
        </p>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recognition Results on PLANTCLEF2017 Dataset</h3>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2">Network</th>
                <th className="border border-gray-300 px-3 py-2">Loss</th>
                <th className="border border-gray-300 px-3 py-2">Family Acc. (%)</th>
                <th className="border border-gray-300 px-3 py-2">Genus Acc. (%)</th>
                <th className="border border-gray-300 px-3 py-2">Species Acc. (%)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ResNet-50', 'CE', '60.29', '55.46', '49.16'],
                ['ResNet-50', 'TAX', '66.88', '61.80', '53.97'],
                ['ResNet-50', 'AHL', '68.45', '63.25', '56.43'],
                ['DenseNet-169', 'CE', '62.7', '55.7', '51.29'],
                ['DenseNet-169', 'TAX', '66.27', '60.93', '53.23'],
                ['DenseNet-169', 'AHL', '65.45', '59.85', '53.52'],
                ['SENet-154', 'CE', '67.84', '63.35', '56.67'],
                ['SENet-154', 'TAX', '71.05', '66.31', '58.61'],
                ['SENet-154', 'AHL', '72.95', '68.05', '60.51'],
                ['Vision Transformer B-16', 'CE', '68.92', '61.09', '54.31'],
                ['Vision Transformer B-16', 'TAX', '72.05', '67.45', '29.25'],
                ['Vision Transformer B-16', 'AHL', '73.40', '68.73', '60.04'],
              ].map(([net, loss, f, g, s], i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">{net}</td>
                  <td className="border border-gray-300 px-3 py-2">{loss}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{f}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{g}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">Recognition Results on VietForest Dataset</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2">Network</th>
                <th className="border border-gray-300 px-3 py-2">Loss</th>
                <th className="border border-gray-300 px-3 py-2">Family Acc. (%)</th>
                <th className="border border-gray-300 px-3 py-2">Genus Acc. (%)</th>
                <th className="border border-gray-300 px-3 py-2">Species Acc. (%)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ResNet-50', 'CE', '80.80', '79.37', '77.87'],
                ['ResNet-50', 'HSL', '79.56', '57.18', '77.27'],
                ['ResNet-50', 'TAX', '81.32', '80.06', '78.43'],
                ['ResNet-50', 'AHL', '82.03', '80.42', '79.02'],
                ['DenseNet-169', 'CE', '80.06', '78.12', '76.67'],
                ['DenseNet-169', 'TAX', '81.66', '80.75', '78.94'],
                ['DenseNet-169', 'AHL', '82.50', '81.65', '80.45'],
                ['SENet-154', 'CE', '81.68', '80.78', '79.00'],
                ['SENet-154', 'TAX', '81.66', '80.75', '79.94'],
                ['SENet-154', 'AHL', '82.5', '81.65', '80.45'],
                ['Vision Transformer B-16', 'CE', '81.02', '79.47', '78.16'],
                ['Vision Transformer B-16', 'TAX', '80.29', '79.41', '78.09'],
                ['Vision Transformer B-16', 'AHL', '81.65', '80.72', '79.12'],
              ].map(([net, loss, f, g, s], i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">{net}</td>
                  <td className="border border-gray-300 px-3 py-2">{loss}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{f}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{g}</td>
                  <td className="border border-gray-300 px-3 py-2 text-center">{s}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Terms &amp; Conditions of Use</h2>
        <p className="text-gray-700">
          The datasets are released for academic research only, and are free to researchers from educational
          or research institutes for non-commercial purposes.
        </p>
      </div>

      <div className="section-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Download</h2>
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
