export const metadata = {
  title: 'VnPersonSearch3000 Dataset',
}

export default function VnPersonSearch3000Page() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">The VnPersonSearch3000 Dataset</h1>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>
          The 3000VnPersonSearch dataset includes pairs of image and description. The images are person bounding
          boxes extracted from video frames. The videos are captured by both moving cameras and fixed-position
          cameras with different fields of view, during day and night time. The capture scenarios are mostly
          crowded street and outdoor festival scenes.
        </p>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Data Collection</h2>
        <p className="text-gray-700 text-justify mb-4">
          In this work, we propose to perform human bounding box extraction via a semi-automatic way. Firstly,
          the YOLO-v4 method is applied to automatically detect humans in each frame. The DEEPSORT tracking method
          is then utilized to track detected persons over time.
        </p>
        <figure className="mb-4">
          <img
            src="/assets/images/datasets/VnPersonSearch3000/detection_result.jpg"
            alt="Examples of human detection and tracking sequences"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '850px' }}
          />
          <figcaption className="text-sm text-gray-500 mt-2 italic">
            Fig 1. Examples of human detection and tracking sequences. The red bounding boxes contain the images
            that are chosen for person search dataset.
          </figcaption>
        </figure>
        <p className="text-gray-700 text-justify mb-4">
          We collect person images for 3000 IDs and each ID has more than two images with front and back/side
          views. To ensure person privacy, all face areas are blurred. A web-based interface is built for
          the descriptors.
        </p>
        <figure className="mb-4">
          <img
            src="/assets/images/datasets/VnPersonSearch3000/annotation.jpg"
            alt="Annotation GUI"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '850px' }}
          />
          <figcaption className="text-sm text-gray-500 mt-2 italic">
            Fig 2. The annotation GUI for Vietnamese language-based person search
          </figcaption>
        </figure>
        <p className="text-gray-700 text-justify mb-4">
          There are 6,302 person images with 12,602 Vietnamese descriptions in total. Each image is described
          by two different subjects.
        </p>
        <figure>
          <img
            src="/assets/images/datasets/VnPersonSearch3000/sample.jpg"
            alt="Sample images and descriptions"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '850px' }}
          />
          <figcaption className="text-sm text-gray-500 mt-2 italic">
            Fig 3. Examples of images and Vietnamese descriptions of three persons/IDs in 3000VnPersonSearch dataset.
          </figcaption>
        </figure>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Vietnamese Text Pre-processing</h2>
        <p className="text-gray-700 text-justify mb-4">
          In 3000VnPersonSearch, there are a total of 6,302 person images with 12,602 Vietnamese descriptions.
          The average length of descriptions is 30.02 tokens, the longest contains 95 tokens and the shortest
          has 7 tokens. There are 1,827 unique tokens with a total of 378,274 occurrences.
        </p>
        <figure className="mb-4">
          <img
            src="/assets/images/datasets/VnPersonSearch3000/chart.jpg"
            alt="Frequency of description length"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '600px' }}
          />
          <figcaption className="text-sm text-gray-500 mt-2 italic">
            Fig 4. Frequency of description length in word/token for 3000VnPersonSearch dataset
          </figcaption>
        </figure>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Main Challenges</h2>
        <figure className="mb-4">
          <img
            src="/assets/images/datasets/VnPersonSearch3000/table1.jpg"
            alt="Comparison of text-based person search datasets"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '700px' }}
          />
          <figcaption className="text-sm text-gray-500 mt-2 italic">
            Table 1. Comparison of text-based person search datasets
          </figcaption>
        </figure>
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
        <ol className="list-decimal list-inside text-gray-700">
          <li>
            Pham, Thi Thanh Thuy, Hong-Quan Nguyen, Hoai Phan, Thi-Ngoc-Diep Do, Thuy-Binh Nguyen, Thanh-Hai Tran,
            and Thi-Lan Le.{' '}
            <em>&quot;Towards a large-scale person search by vietnamese natural language: dataset and methods.&quot;</em>{' '}
            Multimedia Tools and Applications 81, no. 19 (2022): 27569-27600.
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
