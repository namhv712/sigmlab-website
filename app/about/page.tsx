export const metadata = {
  title: 'About',
}

export default function AboutPage() {
  return (
    <div className="page-container">
      <h1 className="page-title">About</h1>
      <div className="section-card">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="md:w-1/2">
            <img
              src="/assets/images/about/C7.jpg"
              alt="C7 Building - HUST"
              className="w-full rounded-xl shadow-sm"
            />
          </div>
          <div className="md:w-1/2 space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <i className="far fa-building mt-1 text-blue-600"></i>
              <div>
                <p className="font-semibold">Room E.802, E.804, E.806, E.808 - C7 Building</p>
                <p>Hanoi University of Science and Technology (HUST)</p>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <p>
                <span className="font-semibold text-gray-800">Website:</span>{' '}
                <a
                  href="https://sigm-seee.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://sigm-seee.github.io
                </a>
              </p>
              <p>
                <span className="font-semibold text-gray-800">Email:</span>{' '}
                <a
                  href="mailto:lan.lethi1@hust.edu.vn"
                  className="text-blue-600 hover:underline"
                >
                  lan.lethi1@hust.edu.vn
                </a>
              </p>
              <p>
                <span className="font-semibold text-gray-800">YouTube:</span>{' '}
                <a
                  href="https://www.youtube.com/@LabSigM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://www.youtube.com/@LabSigM
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
