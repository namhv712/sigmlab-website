export const metadata = {
  title: 'VnPollenBee Dataset',
}

export default function PollenBeePage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">The VnPollenBee Dataset</h1>
      <p className="text-gray-500 italic mb-8">
        &quot;Improving pollen-bearing honey bee detection from videos captured at hive entrance by combining deep learning and handling imbalance techniques&quot;
      </p>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>
          The VnPollenbee Dataset is built for the purpose of serving the problem of detecting pollen bees. The
          dataset contains more than <strong>2000 images</strong> consisting of <strong>1,758 pollen bearing</strong> and{' '}
          <strong>59,068 non-pollen bearing bees</strong>.
        </p>
        <p>
          The dataset was collected at the bee farm of the Vietnam Agricultural Academy by a data acquisition
          system consisting of an Nvidia jetson nano development kit and an IMX477 HQ camera with a 6mm CS-Mount lens.
        </p>
      </div>

      <figure className="mb-6">
        <img
          src="/assets/images/datasets/pollenbee/system.PNG"
          alt="Data acquisition system"
          className="max-w-full rounded-xl shadow-sm"
          style={{ maxWidth: '700px' }}
        />
        <figcaption className="text-sm text-gray-500 mt-2">Data acquisition system</figcaption>
      </figure>

      <figure className="mb-8">
        <img
          src="/assets/images/datasets/pollenbee/video_dataset.gif"
          alt="Example of collected video"
          className="max-w-full rounded-xl shadow-sm"
          style={{ maxWidth: '700px' }}
        />
        <figcaption className="text-sm text-gray-500 mt-2">Example of video collected by our data acquisition system</figcaption>
      </figure>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
        <p className="text-gray-700 text-justify mb-4">
          We collect data as videos over many days, each video lasts <strong>1 minute</strong>, each day from 6 am to 5:30 pm,
          and each time is separate 30 minutes. All videos were recorded in the resolution of <strong>1920×1080 at 60 fps</strong>.
        </p>

        <figure className="mb-4">
          <img src="/assets/images/datasets/pollenbee/light_condition.png" alt="Light conditions" className="max-w-full rounded-xl shadow-sm" />
          <figcaption className="text-sm text-gray-500 mt-2">Examples in different light conditions</figcaption>
        </figure>

        <figure className="mb-6">
          <img src="/assets/images/datasets/pollenbee/pollenbee_variety.png" alt="Pollen bee variety" className="max-w-full rounded-xl shadow-sm" style={{ maxWidth: '500px' }} />
          <figcaption className="text-sm text-gray-500 mt-2">Examples of pollen-bearing bees in our dataset</figcaption>
        </figure>

        <p className="font-semibold text-gray-800 mb-3">Object class distribution:</p>
        <div className="overflow-x-auto mb-6">
          <table className="border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">id</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Label</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Object class</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Instances</th>
              </tr>
            </thead>
            <tbody>
              <tr className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">1</td>
                <td className="border border-gray-300 px-4 py-2">nonpollenbee</td>
                <td className="border border-gray-300 px-4 py-2">Non pollen-bearing bee</td>
                <td className="border border-gray-300 px-4 py-2">59068</td>
              </tr>
              <tr className="even:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">2</td>
                <td className="border border-gray-300 px-4 py-2">pollenbee</td>
                <td className="border border-gray-300 px-4 py-2">Pollen-bearing bee</td>
                <td className="border border-gray-300 px-4 py-2">1758</td>
              </tr>
              <tr className="font-bold">
                <td className="border border-gray-300 px-4 py-2" colSpan={3}>Total:</td>
                <td className="border border-gray-300 px-4 py-2">60826</td>
              </tr>
            </tbody>
          </table>
        </div>

        <figure className="mb-4">
          <img src="/assets/images/datasets/pollenbee/annotations.PNG" alt="Annotation process" className="max-w-full rounded-xl shadow-sm" />
          <figcaption className="text-sm text-gray-500 mt-2">Annotation process using Labelme Annotation Tool</figcaption>
        </figure>

        <p className="text-gray-700 text-justify mb-4">
          The PollenBee dataset was divided into 3 sets: training set (1496 images), validation set (381 images),
          and test set (174 images) at the ratio 0.7:0.2:0.1.
        </p>

        <figure className="mb-4">
          <img src="/assets/images/datasets/pollenbee/data_distribute_each_set_eng.png" alt="Distribution in each set" className="max-w-full rounded-xl shadow-sm" />
          <figcaption className="text-sm text-gray-500 mt-2">Distribution of the number of bees among classes in different sets</figcaption>
        </figure>

        <figure>
          <img src="/assets/images/datasets/pollenbee/height_width_distribute_each_class_eng.png" alt="Width height distribution" className="max-w-full rounded-xl shadow-sm" />
          <figcaption className="text-sm text-gray-500 mt-2">Distribution of the length and width of the bounding boxes</figcaption>
        </figure>
      </div>

      <div className="section-card">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Download</h2>
        <p className="text-gray-700">
          The dataset can be downloaded{' '}
          <a
            href="https://drive.google.com/drive/folders/1fdEcu7CNmEkVAamu9wh_Ppw_-uW3VNY1?usp=share_link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            here
          </a>.{' '}
          The dataset has been divided into training sets, validation sets and test sets with the ratio of 70:20:10.
        </p>
      </div>
    </div>
  )
}
