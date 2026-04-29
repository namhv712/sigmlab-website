export const metadata = {
  title: 'ForestSeg Dataset',
}

export default function ForestSegPage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">The ForestSeg Dataset</h1>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>
          Our aerial forestry dataset (ForestSeg-T1) is a valuable resource comprising 1,832 high-resolution
          UAV images captured over the Vietnam National University of Forestry in Chuong My District, Hanoi.
          The dataset was collected through multiple drone surveys conducted at varying altitudes between 70m
          and 211m, enabling both detailed imagery and broad coverage of forested areas.
        </p>
        <p>
          The dataset includes key flight parameters such as altitude, image resolution, and total coverage
          area. Two drone models were used: DJI Phantom 4 RTK (5472 × 3648 px) and DJI Air 3 (8064 × 6048 px),
          with each flight covering between 7.1 and 24.5 hectares. Images contain between 1 to 17 annotated
          tree instances, most commonly 8 to 9 trees per image, reflecting moderate forest density.
        </p>
        <p>
          ForestSeg-T1 supports a wide range of applications, including forest monitoring, land cover
          classification, biomass estimation, and environmental change detection. The manually annotated tree
          crowns ensure high-quality ground truth for instance segmentation tasks, mimicking human perception.
          Unlike other datasets, ForestSeg-T1 incorporates multi-seasonal imagery, making it particularly
          suitable for long-term forest analysis.
        </p>
        <p>The pictures in the dataset are taken in Hanoi, Vietnam in 2023.</p>
      </div>

      <div className="flex justify-center mb-8">
        <img src="/assets/images/datasets/ForestSeg/Untitled.png" alt="Forest Dataset" className="max-w-full rounded-xl shadow-sm" />
      </div>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Detail</h2>
        <p className="text-gray-700 text-justify mb-4">
          We investigated the impact of temporal variations on instance segmentation performance across four
          intervals: ForestSeg-T1 to ForestSeg-T4. Environmental factors such as lighting, shadow, and
          seasonal changes were considered to assess model robustness under different conditions.
        </p>
        <p className="text-gray-700 text-justify mb-4">
          The segmentation model achieved the best results on ForestSeg-T4, with an AP of 60.82%, AP50 of
          64.71%, and AP70 of 57.13%, aligned with its highest classification accuracy of 71.32%. ForestSeg-T2
          followed with 69.23% classification accuracy and moderate segmentation scores. In contrast,
          ForestSeg-T3 yielded the lowest performance across all metrics, suggesting that data quality and
          timing significantly influence model effectiveness.
        </p>
        <p className="text-gray-700 text-justify mb-6">
          These findings demonstrate that selecting the appropriate temporal interval, particularly one with
          high-resolution imagery and favorable conditions, is crucial for enhancing both classification and
          segmentation performance. Incorporating temporal diversity into training can improve the model&apos;s
          generalizability and reliability in long-term forest monitoring applications.
        </p>

        <p className="font-semibold text-gray-800 mb-3">Table 01: Comparisons of segmentation performance</p>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left">Method</th>
                <th className="border border-gray-300 px-3 py-2">Parameters (M)</th>
                <th className="border border-gray-300 px-3 py-2">Inference (ms)</th>
                <th className="border border-gray-300 px-3 py-2">AP</th>
                <th className="border border-gray-300 px-3 py-2">AP50</th>
                <th className="border border-gray-300 px-3 py-2">AP70</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Mask-RCNN (ResNet-50)', '43.05', '8.3', '30.63', '46.23', '26.17'],
                ['Mask-RCNN (SwinT)', '48.55', '10.8', '56.72', '60.12', '54.64'],
                ['Detectree2', '62.86', '11.4', '22.33', '49.71', '20.22'],
                ['YOLOV11', '22.33', '7.5', '38.30', '52.78', '33.51'],
              ].map(([method, ...vals], i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-left">{method}</td>
                  {vals.map((v, j) => <td key={j} className="border border-gray-300 px-3 py-2">{v}</td>)}
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold">
                <td className="border border-gray-300 px-3 py-2 text-left">Ours</td>
                {['10.81', '6.2', '57.01', '62.21', '55.32'].map((v, j) => <td key={j} className="border border-gray-300 px-3 py-2">{v}</td>)}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="font-semibold text-gray-800 mb-3">Table 02: Experiment results in different intervals</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-3 py-2 text-left">Forest Name</th>
                <th className="border border-gray-300 px-3 py-2">Classification Acc.</th>
                <th className="border border-gray-300 px-3 py-2">AP</th>
                <th className="border border-gray-300 px-3 py-2">AP50</th>
                <th className="border border-gray-300 px-3 py-2">AP70</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['ForestSeg-T1', '65.37', '57.01', '62.21', '55.32'],
                ['ForestSeg-T2', '69.23', '59.72', '62.11', '55.12'],
                ['ForestSeg-T3', '59.01', '54.92', '57.28', '50.01'],
                ['ForestSeg-T4', '71.32', '60.82', '64.71', '57.13'],
              ].map(([name, ...vals], i) => (
                <tr key={i} className="even:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-left">{name}</td>
                  {vals.map((v, j) => <td key={j} className="border border-gray-300 px-3 py-2">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-card">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Terms &amp; Conditions of Use</h2>
        <p className="text-gray-700">
          The datasets are released for academic research only, and are free to researchers from educational
          or research institutes for non-commercial purposes.
        </p>
      </div>
    </div>
  )
}
