export const metadata = {
  title: 'StudentAct Dataset',
}

export default function StudentActPage() {
  return (
    <div className="page-container">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">StudentAct Dataset</h1>

      <div className="section-card mb-8 text-justify text-gray-700 space-y-4">
        <p>
          The StudentAct dataset is meant to aid research efforts in the general area of developing,
          testing and evaluating algorithms for human activity recognition. The Hanoi University of Science and
          Technology (HUST) has copyright in the collection of activity video and associated data and serves
          as a distributor of the StudentAct dataset.
        </p>
        <p>
          The requestor must sign in the commitment and send it to the database administrator
          (lan.lethi1@hust.edu.vn) by email. Failure to observe these restrictions may result in access being
          denied for the database.
        </p>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Usage Restrictions</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>
            <strong>Redistribution:</strong> Without prior written approval from the database administrator, the
            StudentAct dataset will not be further distributed, published, copied, or disseminated in any way.
          </li>
          <li>
            <strong>Modification and Commercial Use:</strong> The StudentAct dataset may not be modified or used
            for commercial purposes.
          </li>
          <li>
            <strong>Publication Requirements:</strong> Still frames or video must not be used in any way that could
            cause the original subject embarrassment or mental anguish.
          </li>
          <li>
            <strong>Citation/Reference:</strong> All papers using StudentAct dataset must cite:
            <em> Phuong-Dung Nguyen, Hong-Quan Nguyen, Thuy-Binh Nguyen, Thi-Lan Le, Thanh-Hai Tran, Hai Vu, Quynh Nguyen Huu,
            &quot;A new dataset and systematic evaluation of deep learning models for student activity recognition from classroom videos&quot;,
            2022 International Conference on Multimedia Analysis and Pattern Recognition (MAPR)</em>
          </li>
        </ol>
      </div>

      <div className="section-card mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Details</h2>
        <p className="text-gray-700 text-justify mb-4">
          The data was collected from classes with different subjects and numbers of students, at the meeting
          room on the 9th floor of B1 building, Hanoi University of Science and Technology. The classroom measures
          9.2m × 8.3m × 3.5m, can accommodate about 60 students, and is equipped with 5 cameras at 5 different
          viewing angles. The cameras are set to record at 25fps, with a resolution of full HD 1920×1080 pixels.
        </p>

        <figure className="mb-6">
          <img
            src="/assets/images/datasets/StudentAct/CameraSetting.png"
            alt="Camera setting for data collection"
            className="max-w-full rounded-xl shadow-sm"
            style={{ maxWidth: '850px' }}
          />
          <figcaption className="text-sm text-gray-500 mt-2">Figure 1: Camera setting for data collection</figcaption>
        </figure>

        <p className="text-gray-700 text-justify mb-4">
          After recording, 45 GB of videos were collected. We split the videos into frames at 5fps, and labeled
          all simultaneous activities in each frame. After labeling 31,046 images, we obtained a set of 596,371
          bounding boxes for 5 activities of interest: sitting, raising_hand, standing, sleeping, and using_phone.
        </p>

        <p className="text-gray-700 mb-3">The labeled data is stored in json files with the following format:</p>
        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-800 font-mono overflow-x-auto">
          <p>{`{"images":[{"file_name":"….jpg","width":1920,"height":1080,"id":…},…],`}</p>
          <p>{`"categories":[{"id":0,"name":"head"},`}</p>
          <p>{`{"id":1,"name":"sitting"},`}</p>
          <p>{`{"id":2,"name":"standing"},`}</p>
          <p>{`{"id":3,"name":"raising_hand"},`}</p>
          <p>{`{"id":4,"name":"using_phone"},`}</p>
          <p>{`{"id":5,"name":"sleeping"}],`}</p>
          <p>{`"annotations":[{"bbox":[top, left, width, height], "category_id":…, "image_id":…, "iscrowd":0, "area":…, "person_id":…,"cam_id":…,"id":…}, …]}`}</p>
        </div>
      </div>
    </div>
  )
}
