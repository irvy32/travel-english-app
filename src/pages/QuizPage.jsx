import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

const CHAPTERS = [
  { id: '01', name: '出國前準備', file: '01_Preparation' },
  { id: '02', name: '機場報到', file: '02_Airport_Checkin' },
  { id: '03', name: '安檢與登機口', file: '03_Security_and_Gate' },
  { id: '04', name: '機上對話', file: '04_Inflight_Conversation' },
  { id: '05', name: '入境通關', file: '05_Immigration' },
  { id: '06', name: '機場交通', file: '06_Airport_Transportation' },
  { id: '07', name: '飯店入住', file: '07_Hotel_Checkin' },
  { id: '08', name: '外出用餐', file: '08_Dining_Out' },
  { id: '09', name: '購物退稅', file: '09_Shopping_and_Tax_Refund' },
  { id: '10', name: '問路導航', file: '10_Directions_and_Navigation' },
  { id: '11', name: '觀光行程', file: '11_Sightseeing_and_Tours' },
  { id: '12', name: '租車', file: '12_Car_Rental' },
  { id: '13', name: '緊急狀況', file: '13_Emergencies' },
  { id: '14', name: '回程班機', file: '14_Return_Flight' },
]

export default function QuizPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <TopNav topicName="測驗" chapterName=""
        onHome={() => navigate('/')}
        onTopic={() => navigate('/travel')} />
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-[#0F1F3D] mb-4">選擇章節開始測驗</h2>
        {CHAPTERS.map((ch, idx) => (
          <div key={ch.id}
            onClick={() => navigate(`/travel/${ch.file}?tab=quiz`)}
            className="flex items-center bg-white border rounded-xl p-4 mb-3
                       shadow-sm cursor-pointer hover:border-[#0EA5A0] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#0F1F3D] text-white
                           flex items-center justify-center font-bold mr-4 flex-shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium text-[#0F1F3D]">{ch.name}</p>
            </div>
            <span className="text-gray-400">›</span>
          </div>
        ))}
      </div>
      <BottomNav currentPage="quiz"
        onNavigate={(page) => {
          if (page === 'home') navigate('/travel')
          if (page === 'review') navigate('/review')
          if (page === 'settings') navigate('/settings')
        }} />
    </div>
  )
}
