'use client';

import { useState, useEffect, useRef } from 'react';
import { recordToolUsage } from '@/lib/analytics';
import NextImage from 'next/image';

// Real QR Code generation with 'qrcode'
import QRCode from 'qrcode';
async function generateQRCode(text: string, size: number = 200): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
  } catch {
    return '';
  }
}

interface QRCodeData {
  id: string;
  type: 'text' | 'url' | 'email' | 'phone' | 'wifi' | 'sms';
  content: string;
  size: number;
  color: string;
  backgroundColor: string;
  qrCode: string;
  createdAt: Date;
}

export function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'email' | 'phone' | 'wifi' | 'sms'>('text');
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [settings, setSettings] = useState({
    size: 200,
    color: '#000000',
    backgroundColor: '#FFFFFF'
  });
  const [formData, setFormData] = useState({
    text: '',
    url: 'https://',
    email: '',
    subject: '',
    body: '',
    phone: '',
    ssid: '',
    password: '',
    security: 'WPA',
    hidden: false,
    smsNumber: '',
    smsMessage: ''
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getQRContent = () => {
    switch (activeTab) {
      case 'text':
        return formData.text;
      case 'url':
        return formData.url;
      case 'email':
        const emailParts = [`mailto:${formData.email}`];
        if (formData.subject) emailParts.push(`subject=${encodeURIComponent(formData.subject)}`);
        if (formData.body) emailParts.push(`body=${encodeURIComponent(formData.body)}`);
        return emailParts.length > 1 ? `${emailParts[0]}?${emailParts.slice(1).join('&')}` : emailParts[0];
      case 'phone':
        return `tel:${formData.phone}`;
      case 'wifi':
        return `WIFI:T:${formData.security};S:${formData.ssid};P:${formData.password};H:${formData.hidden ? 'true' : 'false'};;`;
      case 'sms':
        return `sms:${formData.smsNumber}${formData.smsMessage ? `?body=${encodeURIComponent(formData.smsMessage)}` : ''}`;
      default:
        return '';
    }
  };

  const generateQR = async () => {
    const content = getQRContent();
    if (!content.trim()) return;

    const qrCode = await generateQRCode(content, settings.size);
    if (!qrCode) return;
    
    const newQRCode: QRCodeData = {
      id: Date.now().toString(),
      type: activeTab,
      content,
      size: settings.size,
      color: settings.color,
      backgroundColor: settings.backgroundColor,
      qrCode,
      createdAt: new Date()
    };
    
    setQRCodes(prev => [newQRCode, ...prev]);
    recordToolUsage('qr-code-generator', { action: 'Generated', fileCount: 1 });
  };

  const downloadQR = (qrData: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `qr-code-${qrData.type}-${qrData.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteQR = (id: string) => {
    setQRCodes(prev => prev.filter(qr => qr.id !== id));
  };

  const clearAll = () => {
    setQRCodes([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'url', label: 'URL', icon: '🔗' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'phone', label: 'Phone', icon: '📞' },
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'sms', label: 'SMS', icon: '💬' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          📱 QR Code Generator
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Create QR codes for text, URLs, WiFi credentials, contact information, and more.
          Customize colors and download high-quality PNG images.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              QR Code Content
            </h3>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {activeTab === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Content
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter any text..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>
              )}

              {activeTab === 'url' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {activeTab === 'email' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Email message"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {activeTab === 'phone' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {activeTab === 'wifi' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Network Name (SSID) *
                    </label>
                    <input
                      type="text"
                      value={formData.ssid}
                      onChange={(e) => setFormData(prev => ({ ...prev, ssid: e.target.value }))}
                      placeholder="My WiFi Network"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="WiFi password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Security Type
                    </label>
                    <select
                      value={formData.security}
                      onChange={(e) => setFormData(prev => ({ ...prev, security: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No Password</option>
                    </select>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hidden}
                      onChange={(e) => setFormData(prev => ({ ...prev, hidden: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Hidden Network
                    </span>
                  </label>
                </>
              )}

              {activeTab === 'sms' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.smsNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, smsNumber: e.target.value }))}
                      placeholder="+1234567890"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      value={formData.smsMessage}
                      onChange={(e) => setFormData(prev => ({ ...prev, smsMessage: e.target.value }))}
                      placeholder="Pre-filled SMS message"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={generateQR}
              disabled={!getQRContent().trim()}
              className="w-full mt-6 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              📱 Generate QR Code
            </button>
          </div>

          {/* Customization */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Customization
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Size: {settings.size}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="50"
                  value={settings.size}
                  onChange={(e) => setSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    QR Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.color}
                      onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{settings.color}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{settings.backgroundColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated QR Codes */}
        <div className="space-y-6">
          {qrCodes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Generated QR Codes ({qrCodes.length})
                </h3>
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {qrCodes.map((qrData) => (
                  <div key={qrData.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <NextImage
                          src={qrData.qrCode}
                          alt="QR Code"
                          width={80}
                          height={80}
                          className="border border-gray-200 dark:border-gray-600 rounded"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">
                            {tabs.find(tab => tab.id === qrData.type)?.icon}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {qrData.type}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {qrData.size}px
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 break-all mb-2">
                          {qrData.content.length > 50 
                            ? `${qrData.content.substring(0, 50)}...` 
                            : qrData.content}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => downloadQR(qrData)}
                            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => copyToClipboard(qrData.content)}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Copy Content
                          </button>
                          <button
                            onClick={() => deleteQR(qrData.id)}
                            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Usage Examples */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
              💡 QR Code Ideas
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Business:</strong> Website links, contact info, WiFi access</p>
              <p><strong>Events:</strong> Registration links, venue details, social media</p>
              <p><strong>Marketing:</strong> Product pages, discount codes, app downloads</p>
              <p><strong>Personal:</strong> Social profiles, contact cards, location sharing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
