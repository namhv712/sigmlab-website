'use client'

import { useState, useEffect, useRef } from 'react'

export default function TeamPage() {
  const [alumniIndex, setAlumniIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const VISIBLE = 4

  const alumni = [
    { name: 'Dr. Huong-Giang Doan', affiliation: 'Electrical Power University', img: '/assets/images/team/Allumi Member/DoanThiHuongGiang.png' },
    { name: 'Dr. Sinh-Huy Nguyen', affiliation: 'Academy of Military Science and Technology', img: '/assets/images/team/Allumi Member/NguyenSinhHuy.png' },
    { name: 'Dr. Thanh-Huong Nguyen', affiliation: '', img: '/assets/images/team/non-image.jpg' },
    { name: 'Assoc.Prof. Thanh-Thuy Pham', affiliation: "People's Security Academy", img: '/assets/images/team/Allumi Member/PhamThanhThuy.png' },
    { name: 'Dr. Thanh-Nhan Nguyuen', affiliation: 'Thai Nguyen University', img: '/assets/images/team/Allumi Member/NguyenThanhNhan.png' },
    { name: 'Assoc.Prof. Van-Hung Le', affiliation: 'Tan Trao University', img: '/assets/images/team/Allumi Member/LeVanHung.jpg' },
    { name: 'Dr. Quoc-Hung Nguyen', affiliation: 'University Of Economics Ho Chi Minh City', img: '/assets/images/team/Allumi Member/NguyenQuocHUng.png' },
    { name: 'Dr. Hai-Phong Bui', affiliation: 'Hanoi Architectural University', img: '/assets/images/team/Allumi Member/BuiHaiPhong.jpg' },
    { name: 'Dr. Dinh-Tan Pham', affiliation: 'International School, Vietnam National University', img: '/assets/images/team/Allumi Member/PhamDinhTan.png' },
    { name: 'Msc. Quang-Minh Tran', affiliation: 'S-Phenikaa', img: '/assets/images/team/Master Students/Master - MinhTQ.jpg' },
    { name: 'Doan-Duc Phan', affiliation: 'Samsung SDS Vietnam', img: '/assets/images/team/Master Students/Master - DucPD.jpg' },
  ]

  const maxIndex = Math.max(0, alumni.length - VISIBLE)

  function prev() { setAlumniIndex(i => Math.max(0, i - 1)) }
  function next() { setAlumniIndex(i => Math.min(maxIndex, i + 1)) }

  useEffect(() => {
    if (trackRef.current) {
      const itemWidth = trackRef.current.scrollWidth / alumni.length
      trackRef.current.style.transform = `translateX(-${alumniIndex * itemWidth}px)`
    }
  }, [alumniIndex, alumni.length])

  return (
    <div className="page-container">

      {/* Permanent Members - Senior */}
      <h1 className="page-title">Permanent Members</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {[
          { name: 'Assoc. Prof. Thi-Lan Le', img: '/assets/images/team/Permanent Members/Main - Cô Lan.png', url: 'https://research.hust.edu.vn/lan.lethi1', notes: ['Head of SigM Laboratory', 'Computer Vision - Multimedia Analysis'] },
          { name: 'Assoc. Prof. Hai Vu', img: '/assets/images/team/Permanent Members/Main - Thầy Hải.png', url: 'https://research.hust.edu.vn/hai.vu', notes: ['Computer Vision - Egocentric Vision'] },
          { name: 'Assoc. Prof. Thanh-Hai Tran', img: '/assets/images/team/Permanent Members/Main - Cô Hải.png', url: 'https://research.hust.edu.vn/hai.tranthithanh1', notes: ['Computer Vision - Multimedia Analysis', 'Human-Robot Interaction'] },
        ].map(m => (
          <div key={m.name} className="section-card text-center">
            <img src={m.img} alt={m.name} className="w-44 h-44 object-cover mx-auto mb-4 rounded" />
            <p className="font-bold text-lg mb-1">
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-blue-700">{m.name}</a>
            </p>
            {m.notes.map(n => <p key={n} className="text-sm text-gray-500">{n}</p>)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
        {[
          { name: 'Assoc. Prof. Manh-Thang Hoang', img: '/assets/images/team/Permanent Members/Main - Thầy Thắng.png', url: 'https://research.hust.edu.vn/thang.hoangmanh', notes: ['Signal Processing - Nonlinear Science', 'Complex Network'] },
          { name: 'Dr. Thi Ngoc Diep Do', img: '/assets/images/team/Permanent Members/Main - Cô Diệp.jpg', url: 'https://research.hust.edu.vn/diep.dothingoc', notes: ['Natural Language Processing'] },
          { name: 'Dr. Kim-Hue Ta', img: '/assets/images/team/Permanent Members/Main - Cô Huệ.png', url: 'https://research.hust.edu.vn/hue.tathikim', notes: ['Cryptography - Blockchain'] },
          { name: 'Assoc. Prof. Tien-Dung Nguyen', img: '/assets/images/team/Permanent Members/Main - Thầy Dũng.png', url: 'https://research.hust.edu.vn/dung.nguyentien1', notes: ['Image and Video Analysis', 'Signal Processing'] },
        ].map(m => (
          <div key={m.name} className="section-card text-center">
            <img src={m.img} alt={m.name} className="w-36 h-36 object-cover mx-auto mb-3 rounded" />
            <p className="font-bold text-sm mb-1">
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-blue-700">{m.name}</a>
            </p>
            {m.notes.map(n => <p key={n} className="text-xs text-gray-500">{n}</p>)}
          </div>
        ))}
      </div>

      {/* Invited Researchers */}
      <h1 className="page-title">Invited Researchers</h1>
      <div className="section-card mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Dr. Van-Toi Nguyen', affiliation: 'Phenikaa University', img: '/assets/images/team/Invited Researchers/IR Anh Tới.jpg' },
            { name: 'Dr. Thuy-Binh Nguyen', affiliation: 'University of Transport and Communications', img: '/assets/images/team/Invited Researchers/IR Chị Bình.jpg' },
            { name: 'Dr. Hong-Quan Nguyen', affiliation: 'Viet–Hung Industrial University', img: '/assets/images/team/Invited Researchers/IR Anh Quân.png' },
            { name: 'Dr. Hien-Thanh Duong', affiliation: 'Hanoi University of Industry', img: '/assets/images/team/Invited Researchers/IR Chị Hiền Thanh.jpg' },
            { name: 'Dr. Thi-Lich Nghiem', affiliation: 'Thuong Mai University', img: '/assets/images/team/Invited Researchers/PhD - Chị Lịch.jpg' },
            { name: 'Msc. Van-Nam Hoang', affiliation: 'Computer Vision Company', img: '/assets/images/team/Invited Researchers/IR Anh Nam.jpg' },
            { name: 'Msc. Duy-Tung Nguyen', affiliation: 'School of Information Communication Technology', img: '/assets/images/team/Invited Researchers/Master - TungND.jpg' },
            { name: 'Msc. Hoang-Son Bui', affiliation: 'Hanoi Irradiation Center', img: '/assets/images/team/Invited Researchers/Master - SonBH.jpg' },
          ].map(m => (
            <div key={m.name} className="flex items-center gap-4">
              <img src={m.img} alt={m.name} className="w-24 h-24 object-cover flex-shrink-0 rounded" />
              <div>
                <p className="font-bold text-gray-800">{m.name}</p>
                <p className="text-sm text-gray-500">{m.affiliation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PhD Students */}
      <h1 className="page-title">PhD Students</h1>
      <div className="section-card mb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Phuong-Dung Nguyen', affiliation: 'Thuy Loi University', desc: 'Student activity recognition from classroom videos.', img: '/assets/images/team/PhD Students/phd_DungNguyen.jpg' },
            { name: 'Trung-Hieu Le', affiliation: 'Dai Nam University', desc: 'Activity recognition based on the combination of accelerometers and vision.', img: '/assets/images/team/PhD Students/phd_HieuLe.jpg' },
            { name: 'Thi-Nhung Le', affiliation: 'Vietnam National University of Agriculture', desc: 'Research and development of methods to support the assessment of bee colony health from multi-modal information sources.', img: '/assets/images/team/PhD Students/PhD - Chị Nhung.jpg' },
            { name: 'Thi-Loan Pham', affiliation: 'Hai Duong University', desc: 'Detection and segmentation of ovarian tumors in ultrasound images using deep learning.', img: '/assets/images/team/PhD Students/PhD - Chị Loan.jpg' },
            { name: 'Thi-Hoai Phan', affiliation: "People's Security Academy", desc: 'Research and development of object image search methods from Vietnamese natural language descriptions.', img: '/assets/images/team/PhD Students/phd_HoaiPhan.jpg' },
            { name: 'Tuan-Dung Kieu', affiliation: 'Thuy Loi University', desc: 'Research and development of federated learning algorithms for computer vision applications.', img: '/assets/images/team/PhD Students/PhD - Anh Dũng.jpg' },
            { name: 'Thu-Huong Nguyen', affiliation: 'Thuy Loi University', desc: 'Studying on deep learning models to support noisy labeled data - applying for endoscopic image diagnostic assistance.', img: '/assets/images/team/PhD Students/PhD - Chị Hương.jpg' },
            { name: 'Thi-Thuy Pham', affiliation: 'Viet Tri University Of Industry', desc: 'Research and development of a machine learning model for predicting stages of liver disease based on lifestyle habits, laboratory test results, and ultrasound findings.', img: '/assets/images/team/PhD Students/PhD - Chị Thủy.jpg' },
            { name: 'Quoc-Vi Tran', affiliation: 'Vinh Phuc Hospital', desc: 'Ultrasound images analysis.', img: '/assets/images/team/PhD Students/PhD - Anh Vị.jpg' },
            { name: 'Hoang-Bach Nguyen', affiliation: 'Military Information Technology Institute', desc: 'Traumatic brain injury prognosis using multi-modal information and artificial intelligence.', img: '/assets/images/team/PhD Students/PhD - Anh Bách.jpg' },
            { name: 'Quang-Do Tran', affiliation: 'Bach Mai Hospital', desc: 'Data Security in Medical Information System.', img: '/assets/images/team/PhD Students/PhD_QuangDo.png' },
            { name: 'Thai-Binh Nguyen', affiliation: 'Viettel High Tech', desc: 'Research and Development of Reconfigurable Intelligent Surface (RIS) for Next-Generation Wireless Communications.', img: '/assets/images/team/PhD Students/PhD_AnhBinh.jpg' },
            { name: 'Quang-Duy Pham', affiliation: 'VNPT Media', desc: 'Research and Development of 3D Model Reconstruction Techniques Based on UAV Image Data.', img: '/assets/images/team/PhD Students/PhD_QuangDuyPham.jpg' },
            { name: 'Thi Thanh Tam Nguyen', affiliation: 'Posts and Telecommunications Institute of Technology', desc: 'Improving the performance of 3D rendering and reconstruction methods from set of images.', img: '/assets/images/team/PhD Students/PhD_ChiTAm.jpg' },
          ].map(m => (
            <div key={m.name} className="flex items-start gap-4">
              <img src={m.img} alt={m.name} className="w-24 h-28 object-cover flex-shrink-0 rounded" />
              <div>
                <p className="font-bold text-lg text-gray-800">{m.name}</p>
                <p className="text-sm font-medium text-gray-600 mb-1">{m.affiliation}</p>
                <p className="text-sm text-gray-500 italic">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Students */}
      <h1 className="page-title">Master Students</h1>
      <div className="section-card mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Minh-Hanh Tran', desc: 'Segmentation of Gastrointestinal Tract Lesions utilizing a combination of Images and Text.', img: '/assets/images/team/Master Students/Master - HanhTM.png' },
            { name: 'Vu-An Hoang', desc: 'Vision-Language Models for Medical Image Analysis.', img: '/assets/images/team/Master Students/Master - AnHV.jpg' },
            { name: 'Thai-Khanh Nguyen', desc: 'Prognosis of traumatic brain injury using multi-modal information based on deep learning.', img: '/assets/images/team/Master Students/Master - KhanhNT.JPG' },
            { name: 'Dinh-Bao Nguyen', desc: 'Person re-identification in camera networks with domain adaptation.', img: '/assets/images/team/Master Students/Master - DinhBao.jpg' },
            { name: 'Thi Khanh Linh Do', desc: 'Semi-Supervised Learning For Lesion Segmentation On Medical Images.', img: '/assets/images/team/Master Students/Master - DoThiKhanhLinh.jpeg' },
            { name: 'Minh-Hoang Le', desc: 'Research and development of Video Moment retrieval via Natural Language Queries.', img: '/assets/images/team/non-image.jpg' },
            { name: 'Thanh-Tung Cao', desc: 'Lesion Tracking Techniques in Endoscopic Video Analysis Utilizing Advanced Predictive and Re-identification Models.', img: '/assets/images/team/Master Students/Master - TungCT.png' },
            { name: 'Dai-Duong Tran', desc: 'Nonlinear Independent Component Analysis.', img: '/assets/images/team/non-image.jpg' },
            { name: 'Van-Bang Tran', desc: 'Text-based person search with limited image-text pairs.', img: '/assets/images/team/Master Students/Master - BangNLP.jpeg' },
            { name: 'Duc-Manh Nguyen', desc: 'Identification of Botanical origin from pollen grains in honey using computer vision-based techniques.', img: '/assets/images/team/non-image.jpg' },
            { name: 'Gia-Minh Pham', desc: '', img: '/assets/images/team/Master Students/Master - GiaMinh.png' },
            { name: 'Duc-Duy Pham', desc: '', img: '/assets/images/team/Master Students/Master - DucDuy.png' },
          ].map(m => (
            <div key={m.name} className="flex items-start gap-3">
              <img src={m.img} alt={m.name} className="w-20 h-24 object-cover flex-shrink-0 rounded" />
              <div>
                <p className="font-bold text-base text-gray-800">{m.name}</p>
                <p className="text-sm text-gray-500 italic mt-1">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alumni Members */}
      <h1 className="page-title">Alumni Members</h1>
      <div className="section-card mb-14">
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ width: `${(alumni.length / VISIBLE) * 100}%` }}
          >
            {alumni.map(m => (
              <div key={m.name} className="text-center px-4" style={{ width: `${100 / alumni.length}%` }}>
                <img src={m.img} alt={m.name} className="w-28 h-28 object-cover mx-auto mb-3 rounded" />
                <p className="font-bold text-sm text-gray-800">{m.name}</p>
                <p className="text-xs text-gray-500">{m.affiliation}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={prev} disabled={alumniIndex === 0} className="px-5 py-2 border border-gray-400 text-sm uppercase tracking-wide hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-40">Previous</button>
          <button onClick={next} disabled={alumniIndex >= maxIndex} className="px-5 py-2 border border-gray-400 text-sm uppercase tracking-wide hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-40">Next</button>
        </div>
      </div>

      {/* Activities */}
      <h1 className="page-title">Activities</h1>
      <div className="section-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { src: '/assets/images/about/Lab20-11 - Copy.jpg', caption: '20/11/2024' },
            { src: '/assets/images/team/team1.jpg', caption: 'MAPR 2022' },
            { src: '/assets/images/team/team2.jpg', caption: 'Team building 2022' },
            { src: '/assets/images/team/team3.jpg', caption: 'Foreign members' },
            { src: '/assets/images/team/team6.png', caption: 'MAPR 2024' },
          ].map(img => (
            <figure key={img.caption} className="relative rounded-xl overflow-hidden shadow-sm">
              <img src={img.src} alt={img.caption} className="w-full h-48 object-cover" />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-sm text-center py-2">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

    </div>
  )
}
