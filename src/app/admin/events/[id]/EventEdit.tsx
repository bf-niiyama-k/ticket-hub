
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface EventEditProps {
  eventId: string;
}

export default function EventEdit({ eventId }: EventEditProps) {
  const [event, setEvent] = useState({
    id: '',
    title: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    status: 'draft',
    image: '',
    ticketTypes: [
      {
        id: 1,
        name: '一般チケット',
        price: 3000,
        quantity: 100,
        description: '一般入場券',
        status: 'active',
        sold: 0
      }
    ]
  });
  
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // ダミーデータの読み込み
    const dummyEvents = {
      '1': {
        id: '1',
        title: '春のコンサート2024',
        date: '2024-04-15',
        time: '19:00',
        venue: 'メインホール',
        description: '春の訪れを祝う特別なコンサートイベントです。著名なアーティストによる素晴らしいパフォーマンスをお楽しみください。',
        status: 'published',
        image: 'https://readdy.ai/api/search-image?query=elegant%20concert%20hall%20with%20grand%20piano%20and%20warm%20lighting%20creating%20sophisticated%20atmosphere%20for%20spring%20classical%20music%20performance%20with%20beautiful%20stage%20design&width=800&height=400&seq=concert1&orientation=landscape',
        ticketTypes: [
          {
            id: 1,
            name: 'VIPチケット',
            price: 8000,
            quantity: 30,
            description: '最前列席、特典付き',
            status: 'active',
            sold: 25
          },
          {
            id: 2,
            name: '一般チケット',
            price: 5000,
            quantity: 150,
            description: '一般入場券',
            status: 'active',
            sold: 120
          },
          {
            id: 3,
            name: '学生チケット',
            price: 3000,
            quantity: 20,
            description: '学生証提示必須',
            status: 'paused',
            sold: 5
          }
        ]
      },
      '2': {
        id: '2',
        title: 'ビジネスセミナー',
        date: '2024-04-20',
        time: '14:00',
        venue: '会議室A',
        description: '最新のビジネストレンドと戦略について学ぶセミナーです。業界のエキスパートが講演します。',
        status: 'draft',
        image: 'https://readdy.ai/api/search-image?query=modern%20business%20conference%20room%20with%20professional%20presentation%20setup%20clean%20corporate%20environment%20with%20projector%20and%20elegant%20seating%20arrangement&width=800&height=400&seq=seminar1&orientation=landscape',
        ticketTypes: [
          {
            id: 1,
            name: '一般参加',
            price: 2000,
            quantity: 50,
            description: 'セミナー参加券',
            status: 'draft',
            sold: 0
          }
        ]
      },
      '3': {
        id: '3',
        title: '夏祭り2024',
        date: '2024-07-15',
        time: '17:00',
        venue: '野外ステージ',
        description: '夏の夜に開催される楽しい祭りイベントです。屋台や音楽ライブをお楽しみください。',
        status: 'published',
        image: 'https://readdy.ai/api/search-image?query=vibrant%20summer%20festival%20with%20colorful%20lanterns%20food%20stalls%20and%20outdoor%20stage%20evening%20atmosphere%20with%20warm%20lighting%20and%20festive%20decorations&width=800&height=400&seq=festival1&orientation=landscape',
        ticketTypes: [
          {
            id: 1,
            name: '入場券',
            price: 1500,
            quantity: 300,
            description: '祭り入場券',
            status: 'active',
            sold: 250
          },
          {
            id: 2,
            name: '食事付きチケット',
            price: 3000,
            quantity: 200,
            description: '祭り入場券＋食事券',
            status: 'soldout',
            sold: 200
          }
        ]
      }
    };

    const eventData = dummyEvents[eventId as keyof typeof dummyEvents];
    if (eventData) {
      setEvent(eventData);
    }
  }, [eventId]);

  const handleSave = () => {
    alert('イベント情報を保存しました');
  };

  const handleAddTicketType = () => {
    const newTicketType = {
      id: event.ticketTypes.length + 1,
      name: '新しいチケット',
      price: 1000,
      quantity: 50,
      description: '',
      status: 'draft',
      sold: 0
    };
    setEvent({
      ...event,
      ticketTypes: [...event.ticketTypes, newTicketType]
    });
  };

  const handleRemoveTicketType = (ticketId: number) => {
    setEvent({
      ...event,
      ticketTypes: event.ticketTypes.filter(ticket => ticket.id !== ticketId)
    });
  };

  const updateTicketType = (ticketId: number, field: string, value: string | number) => {
    setEvent({
      ...event,
      ticketTypes: event.ticketTypes.map(ticket =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      )
    });
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'soldout':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '販売中';
      case 'paused':
        return '一時停止';
      case 'soldout':
        return '完売';
      case 'draft':
        return '下書き';
      default:
        return '不明';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin/events"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-arrow-left-line text-gray-600 text-xl w-5 h-5 flex items-center justify-center"></i>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">イベント編集</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                プレビュー
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* タブナビゲーション */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('basic')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'basic'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                基本情報
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === 'tickets'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                チケット設定
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      イベント名
                    </label>
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => setEvent({...event, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      開催日
                    </label>
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) => setEvent({...event, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      開始時間
                    </label>
                    <input
                      type="time"
                      value={event.time}
                      onChange={(e) => setEvent({...event, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会場
                    </label>
                    <input
                      type="text"
                      value={event.venue}
                      onChange={(e) => setEvent({...event, venue: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    イベント説明
                  </label>
                  <textarea
                    value={event.description}
                    onChange={(e) => setEvent({...event, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ステータス
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={event.status === 'draft'}
                        onChange={(e) => setEvent({...event, status: e.target.value})}
                        className="mr-2"
                      />
                      下書き
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={event.status === 'published'}
                        onChange={(e) => setEvent({...event, status: e.target.value})}
                        className="mr-2"
                      />
                      公開
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">チケット種類</h3>
                  <button
                    onClick={handleAddTicketType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    チケット追加
                  </button>
                </div>

                <div className="space-y-4">
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">チケット #{ticket.id}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTicketStatusColor(ticket.status)}`}>
                            {getTicketStatusText(ticket.status)}
                          </span>
                        </div>
                        {event.ticketTypes.length > 1 && (
                          <button
                            onClick={() => handleRemoveTicketType(ticket.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="ri-delete-bin-line text-lg w-5 h-5 flex items-center justify-center"></i>
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            チケット名
                          </label>
                          <input
                            type="text"
                            value={ticket.name}
                            onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            価格 (円)
                          </label>
                          <input
                            type="number"
                            value={ticket.price}
                            onChange={(e) => updateTicketType(ticket.id, 'price', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            販売数量
                          </label>
                          <input
                            type="number"
                            value={ticket.quantity}
                            onChange={(e) => updateTicketType(ticket.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            販売ステータス
                          </label>
                          <select
                            value={ticket.status}
                            onChange={(e) => updateTicketType(ticket.id, 'status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm pr-8"
                          >
                            <option value="draft">下書き</option>
                            <option value="active">販売中</option>
                            <option value="paused">一時停止</option>
                            <option value="soldout">完売</option>
                          </select>
                        </div>
                      </div>

                      {/* 販売状況 */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">販売状況</span>
                          <span className="font-medium">
                            {ticket.sold} / {ticket.quantity} 枚
                            ({Math.round((ticket.sold / ticket.quantity) * 100)}%)
                          </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(ticket.sold / ticket.quantity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          説明
                        </label>
                        <textarea
                          value={ticket.description}
                          onChange={(e) => updateTicketType(ticket.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                          maxLength={500}
                        />
                      </div>

                      {/* チケットステータス管理ボタン */}
                      <div className="flex space-x-2 mt-4">
                        {ticket.status !== 'active' && (
                          <button
                            onClick={() => updateTicketType(ticket.id, 'status', 'active')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                          >
                            販売開始
                          </button>
                        )}
                        {ticket.status === 'active' && (
                          <button
                            onClick={() => updateTicketType(ticket.id, 'status', 'paused')}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors whitespace-nowrap"
                          >
                            販売停止
                          </button>
                        )}
                        {ticket.status !== 'soldout' && ticket.sold >= ticket.quantity && (
                          <button
                            onClick={() => updateTicketType(ticket.id, 'status', 'soldout')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                          >
                            完売設定
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* プレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">イベントプレビュー</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <i className="ri-close-line text-gray-600 text-xl w-5 h-5 flex items-center justify-center"></i>
              </button>
            </div>
            
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                <Image
                  src={event.image}
                  alt={event.title}
                  width={768}
                  height={256}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <i className="ri-calendar-line text-lg mr-3 w-5 h-5 flex items-center justify-center"></i>
                      <span>{event.date} {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="ri-map-pin-line text-lg mr-3 w-5 h-5 flex items-center justify-center"></i>
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">イベント詳細</h2>
                  <p className="text-gray-600 leading-relaxed">{event.description}</p>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">チケット</h2>
                  <div className="grid gap-4">
                    {event.ticketTypes.filter(ticket => ticket.status !== 'draft').map((ticket) => (
                      <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTicketStatusColor(ticket.status)}`}>
                                {getTicketStatusText(ticket.status)}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">{ticket.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">¥{ticket.price.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">残り{ticket.quantity - ticket.sold}枚</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
